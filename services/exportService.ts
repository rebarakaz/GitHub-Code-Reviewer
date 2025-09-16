import type { FileReview, FeedbackItem } from '../types';

function formatFeedbackItemTxt(item: FeedbackItem): string {
    return `[${item.severity}] on line ${item.line}: ${item.suggestion}`;
}

export function formatAsTxt(reviews: FileReview[]): string {
    let content = 'GitHub Code Review Report\n';
    content += '='.repeat(40) + '\n\n';

    reviews.forEach(review => {
        content += `File: ${review.filePath}\n`;
        content += `Summary: ${review.summary || 'N/A'}\n`;
        content += '-'.repeat(40) + '\n';

        if (review.error) {
            content += `  Error: ${review.error}\n\n`;
        } else if (review.feedback.length > 0) {
            review.feedback.forEach(item => {
                content += `  - ${formatFeedbackItemTxt(item)}\n`;
            });
            content += '\n';
        } else {
            content += '  No issues found. Great job!\n\n';
        }
    });

    return content;
}

export function formatAsMarkdown(reviews: FileReview[]): string {
    let content = '# GitHub Code Review Report\n\n';
    
    reviews.forEach(review => {
        content += `## \`${review.filePath}\`\n\n`;
        if (review.summary) {
            content += `> ${review.summary}\n\n`;
        }

        if (review.error) {
            content += `**Error:** ${review.error}\n\n`;
        } else if (review.feedback.length > 0) {
            content += '| Severity | Line | Suggestion |\n';
            content += '|----------|------|------------|\n';
            review.feedback.forEach(item => {
                const suggestion = item.suggestion.replace(/\n/g, '<br/>').replace(/\|/g, '\\|');
                content += `| **${item.severity}** | \`${item.line}\` | ${suggestion} |\n`;
            });
            content += '\n';
        } else {
            content += '✅ No issues found. Great job!\n\n';
        }
        content += '---\n\n';
    });
    
    return content;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}