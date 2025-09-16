
import React, { useState } from 'react';
import { GithubIcon } from './icons/GithubIcon';
import { KeyIcon } from './icons/KeyIcon';

interface GithubInputFormProps {
  url: string;
  setUrl: (url: string) => void;
  githubToken: string;
  setGithubToken: (token: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const GithubInputForm: React.FC<GithubInputFormProps> = ({ url, setUrl, githubToken, setGithubToken, onSubmit, isLoading }) => {
  const [showTokenInput, setShowTokenInput] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <GithubIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g., https://github.com/facebook/react/tree/main"
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Reviewing...
            </>
          ) : (
            'Review Code'
          )}
        </button>
      </div>

      <div>
        <button type="button" onClick={() => setShowTokenInput(!showTokenInput)} className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
            {showTokenInput ? 'Hide' : 'Set'} GitHub Token (Optional)
        </button>
      </div>

      {showTokenInput && (
        <div className="relative flex-grow">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <KeyIcon className="h-5 w-5 text-gray-400" />
           </div>
           <input
            type="password"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            placeholder="Enter GitHub Personal Access Token to avoid rate limits"
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
            disabled={isLoading}
           />
        </div>
      )}
    </form>
  );
};
