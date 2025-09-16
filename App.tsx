import React, { useState, useCallback } from 'react';
import { GithubInputForm } from './components/GithubInputForm';
import { Loader } from './components/Loader';
import { ReviewResults } from './components/ReviewResults';
import { getRepoFilesWithContent } from './services/githubService';
import { reviewCodeFile } from './services/geminiService';
import type { LoadingState, FileReview } from './types';

export default function App() {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [githubToken, setGithubToken] = useState<string>('');
  const [reviews, setReviews] = useState<FileReview[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleCodeReview = useCallback(async () => {
    if (!repoUrl) {
      setError('Please enter a GitHub repository URL.');
      return;
    }

    setLoadingState('fetching_repo');
    setError(null);
    setReviews([]);

    try {
      const files = await getRepoFilesWithContent(repoUrl, githubToken);
      if (files.length === 0) {
        setError('No reviewable code files found in the repository. The tool currently reviews JS, TS, Python, and other common languages.');
        setLoadingState('error');
        return;
      }

      setLoadingState('reviewing_code');
      
      // FIX: Corrected the call to reviewCodeFile to pass only one argument as expected.
      // The API key is handled within geminiService using process.env.API_KEY, which required removing the API key state and management from this component to adhere to guidelines.
      const reviewPromises = files.map(file => reviewCodeFile(file));
      const results = await Promise.all(reviewPromises);
      
      setReviews(results);
      setLoadingState('success');

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(errorMessage);
      setError(errorMessage);
      setLoadingState('error');
    }
  }, [repoUrl, githubToken]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            GitHub Code Reviewer
          </h1>
          <p className="mt-2 text-gray-400">
            Automated code analysis powered by the Gemini API.
          </p>
        </header>

        <main>
            <>
              <GithubInputForm
                url={repoUrl}
                setUrl={setRepoUrl}
                githubToken={githubToken}
                setGithubToken={setGithubToken}
                onSubmit={handleCodeReview}
                isLoading={loadingState === 'fetching_repo' || loadingState === 'reviewing_code'}
              />

              <div className="mt-8">
                { (loadingState === 'fetching_repo' || loadingState === 'reviewing_code') && <Loader state={loadingState} /> }
                
                { loadingState === 'error' && (
                  <div className="bg-red-900 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-center">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                  </div>
                )}
                
                { loadingState === 'success' && <ReviewResults reviews={reviews} /> }
              </div>
            </>
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>This tool is for educational and demonstrational purposes. Always perform a manual review for critical applications.</p>
        </footer>
      </div>
    </div>
  );
}
