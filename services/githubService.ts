
import type { RepoFile, RepoFileWithContent } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';
const MAX_FILES_TO_REVIEW = 15;
const MAX_FILE_SIZE_CHARS = 20000; // Limit file size to avoid large API requests

const REVIEWABLE_EXTENSIONS = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.rb', '.go', '.java', '.php', '.cs', '.c', '.cpp', '.h', '.hpp',
    '.html', '.css', '.scss', '.less', '.vue', '.svelte'
];

const IGNORED_PATHS = [
    'node_modules/', 'dist/', 'build/', 'vendor/', '.git/', 'package-lock.json', 'yarn.lock'
];

function parseRepoUrl(url: string): { owner: string; repo: string; branch?: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/);
  if (match && match[1] && match[2]) {
    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');
    const branch = match[3] ? match[3].split('/')[0] : undefined;
    return { owner, repo, branch };
  }
  return null;
}

async function fetchDefaultBranch(owner: string, repo: string, token?: string): Promise<string> {
    const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers });

    if (!response.ok) {
        if (response.status === 403) {
            throw new Error('GitHub API rate limit exceeded. Please provide a GitHub Personal Access Token to increase the limit, or wait and try again.');
        }
        if (response.status === 404) {
            throw new Error('Repository not found. Please check the URL is correct and the repository is public.');
        }
        throw new Error(`Failed to fetch repo details: ${response.statusText}`);
    }
    const data = await response.json();
    return data.default_branch;
}

async function fetchFileTree(owner: string, repo: string, branch: string, token?: string): Promise<RepoFile[]> {
    const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 1. Get the commit SHA for the given branch to get the tree SHA from
    const branchUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/branches/${branch}`;
    const branchResponse = await fetch(branchUrl, { headers });
    if (!branchResponse.ok) {
        if (branchResponse.status === 404) {
            throw new Error(`Branch "${branch}" not found in repository ${owner}/${repo}. Please check the branch name in the URL.`);
        }
        throw new Error(`Failed to fetch branch details: ${branchResponse.statusText}`);
    }
    const branchData = await branchResponse.json();
    const treeSha = branchData.commit.commit.tree.sha;

    // 2. Get the file tree recursively using the tree SHA
    const treeUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`;
    const treeResponse = await fetch(treeUrl, { headers });
    if (!treeResponse.ok) {
         throw new Error(`Failed to fetch file tree from GitHub API: ${treeResponse.statusText}`);
    }
    const treeData = await treeResponse.json();
    
    if (treeData.truncated) {
        console.warn("File tree from GitHub is truncated as it contains too many files. Not all files may be reviewed.");
    }

    return treeData.tree
        .filter((file: any) => file.type === 'blob') // only include files, not directories
        .map((file: any) => ({ path: file.path }))
        .filter((file: RepoFile) => 
            REVIEWABLE_EXTENSIONS.some(ext => file.path.endsWith(ext)) &&
            !IGNORED_PATHS.some(ignored => file.path.startsWith(ignored))
        );
}


export async function getRepoFilesWithContent(url: string, token?: string): Promise<RepoFileWithContent[]> {
    const parsed = parseRepoUrl(url);
    if (!parsed) {
        throw new Error('Invalid GitHub URL. Use format: https://github.com/owner/repo or https://github.com/owner/repo/tree/branch');
    }
    const { owner, repo } = parsed;
    
    const branch = parsed.branch || await fetchDefaultBranch(owner, repo, token);
    
    const files = await fetchFileTree(owner, repo, branch, token);

    const filesToReview = files.slice(0, MAX_FILES_TO_REVIEW);

    const contentPromises = filesToReview.map(async (file) => {
        try {
            // Use CDN for individual file content for performance
            const fileUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${file.path}`;
            const response = await fetch(fileUrl);
            if (!response.ok) {
                 // Don't throw for single file fetch errors, just log and skip
                console.error(`Skipping file ${file.path}: Failed to fetch from CDN with status ${response.statusText}`);
                return null;
            }
            let content = await response.text();
            
            if (content.length > MAX_FILE_SIZE_CHARS) {
                console.warn(`File content truncated for ${file.path}`);
                content = content.substring(0, MAX_FILE_SIZE_CHARS);
            }
            
            return { path: file.path, content };
        } catch (error) {
            console.error(`Skipping file ${file.path} due to error:`, error);
            return null;
        }
    });

    const results = await Promise.all(contentPromises);
    return results.filter((file): file is RepoFileWithContent => file !== null);
}
