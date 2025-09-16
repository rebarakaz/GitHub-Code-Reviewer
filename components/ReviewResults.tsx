import React from 'react';
import type { FileReview, FeedbackItem } from '../types';
import { SeverityIcon } from './icons/SeverityIcon';
import { FeedbackSeverity } from '../types';
import { formatAsTxt, formatAsMarkdown, downloadFile } from '../services/exportService';
import { DownloadIcon } from './icons/DownloadIcon';

const FeedbackCard: React.FC<{ item: FeedbackItem }> = ({ item }) => {
  const severityClasses: Record<FeedbackSeverity, { bg: string, text: string }> = {
    [FeedbackSeverity.High]: { bg: 'bg-red-900/50', text: 'text-red-300' },
    [FeedbackSeverity.Medium]: { bg: 'bg-yellow-900/50', text: 'text-yellow-300' },
    [FeedbackSeverity.Low]: { bg: 'bg-blue-900/50', text: 'text-blue-300' },
    [FeedbackSeverity.Info]: { bg: 'bg-gray-700/50', text: 'text-gray-300' },
  };
  
  const { bg, text } = severityClasses[item.severity];

  return (
    <div className={`p-4 rounded-lg flex items-start gap-4 ${bg}`}>
      <div className="flex-shrink-0 mt-1">
        <SeverityIcon severity={item.severity} />
      </div>
      <div className="flex-grow">
        <div className="flex items-baseline gap-3">
            <span className={`font-bold text-sm ${text}`}>{item.severity}</span>
            <span className="text-gray-400 font-mono text-sm">Line: {item.line}</span>
        </div>
        <p className="text-gray-200 mt-1">{item.suggestion}</p>
      </div>
    </div>
  );
};

const FileReviewCard: React.FC<{ review: FileReview }> = ({ review }) => (
  <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-md overflow-hidden">
    <div className="px-5 py-4 bg-gray-800 border-b border-gray-700">
      <h3 className="font-mono font-bold text-lg text-indigo-300 break-all">{review.filePath}</h3>
      {review.summary && <p className="text-sm text-gray-400 mt-1 italic">"{review.summary}"</p>}
    </div>

    <div className="p-5 space-y-4">
      {review.error ? (
        <div className="text-red-400 bg-red-900/50 p-3 rounded-md">
          <strong>Error:</strong> {review.error}
        </div>
      ) : review.feedback.length > 0 ? (
        review.feedback.map((item, index) => <FeedbackCard key={index} item={item} />)
      ) : (
        <div className="text-green-400 bg-green-900/50 p-3 rounded-md text-center">
          No issues found. Great job!
        </div>
      )}
    </div>
  </div>
);


export const ReviewResults: React.FC<{ reviews: FileReview[] }> = ({ reviews }) => {
  const handleExport = (format: 'txt' | 'md') => {
    // Sanitize repo name for filename
    const repoName = reviews.length > 0 ? reviews[0].filePath.split('/')[0] : 'review';
    const safeRepoName = repoName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `code-review-${safeRepoName}-${timestamp}`;
    
    if (format === 'txt') {
      const content = formatAsTxt(reviews);
      downloadFile(content, `${filename}.txt`, 'text/plain;charset=utf-8;');
    } else if (format === 'md') {
      const content = formatAsMarkdown(reviews);
      downloadFile(content, `${filename}.md`, 'text/markdown;charset=utf-8;');
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-700 pb-2">
            <h2 className="text-2xl font-bold text-gray-300">Review Results</h2>
            {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                   <button 
                        onClick={() => handleExport('md')} 
                        className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-sm font-medium text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
                        aria-label="Export results as Markdown"
                    >
                        <DownloadIcon className="h-4 w-4" />
                        <span>Markdown</span>
                    </button>
                    <button 
                        onClick={() => handleExport('txt')} 
                        className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-sm font-medium text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
                        aria-label="Export results as a text file"
                    >
                        <DownloadIcon className="h-4 w-4" />
                        <span>TXT</span>
                    </button>
                </div>
            )}
        </div>
        {reviews.map((review) => (
            <FileReviewCard key={review.filePath} review={review} />
        ))}
    </div>
  );
};