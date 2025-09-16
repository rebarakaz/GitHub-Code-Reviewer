import React, { useState } from 'react';

interface ApiKeyFormProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onApiKeySubmit }) => {
  const [localApiKey, setLocalApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localApiKey.trim()) {
      onApiKeySubmit(localApiKey.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-100">Enter Your API Key</h1>
                <p className="mt-2 text-gray-400">
                    To use the GitHub Code Reviewer, please provide your Google AI API key.
                </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="apiKey" className="sr-only">
                        Google AI API Key
                    </label>
                    <input
                        id="apiKey"
                        name="apiKey"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                        placeholder="Enter your Gemini API key"
                        value={localApiKey}
                        onChange={(e) => setLocalApiKey(e.target.value)}
                    />
                </div>
                
                <button
                    type="submit"
                    className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                >
                    Start Reviewing
                </button>
            </form>

            <div className="p-4 mt-4 bg-yellow-900/50 border border-yellow-700 text-yellow-200 rounded-lg text-sm">
                <p className="font-bold">Security Warning</p>
                <p className="mt-1">
                    Your API key is used only for this session and is not stored. However, be cautious about entering sensitive keys into any web application.
                </p>
            </div>

            <p className="text-center text-gray-500 text-xs mt-4">
                You can get your API key from the {' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                    Google AI Studio
                </a>.
            </p>
        </div>
    </div>
  );
};