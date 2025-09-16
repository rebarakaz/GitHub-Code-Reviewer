# GitHub Code Reviewer

**GitHub Code Reviewer** is a powerful, web-based tool that leverages the Google Gemini API to perform intelligent, automated code reviews on any public GitHub repository.

Simply provide a repository URL, and the application will fetch the codebase, analyze supported files, and generate a comprehensive report with actionable feedback. It's designed to help developers identify potential bugs, improve performance, adhere to best practices, and enhance overall code quality.

## ✨ Features

- **🤖 AI-Powered Analysis**: Utilizes the advanced reasoning of the `gemini-2.5-flash` model to provide context-aware and insightful code suggestions.
- **🔗 Seamless GitHub Integration**: Analyzes code directly from public GitHub repositories by simply pasting a URL.
- **📊 Detailed & Structured Feedback**: Delivers line-specific feedback categorized by severity (`High`, `Medium`, `Low`, `Info`) to help prioritize improvements.
- **📝 File Summaries**: Automatically generates a concise, one-sentence summary of each file's purpose.
- **🔑 Rate Limit Handling**: Includes an option to add a GitHub Personal Access Token to avoid API rate limits on larger repositories.
- **📄 Exportable Reports**: Easily download the complete review report as a formatted **Markdown** or **TXT** file for offline use, documentation, or sharing with your team.
- **💻 Modern Tech Stack**: Built with **React**, **TypeScript**, and **Tailwind CSS** for a clean, responsive, and modern user experience.

## 🚀 How to Use

1.  Open the application.
2.  Paste the URL of a public GitHub repository into the input field (e.g., `https://github.com/owner/repo/tree/main`).
3.  (Optional) If you are analyzing a large repository or encounter rate limits, click **"Set GitHub Token"** and enter your Personal Access Token.
4.  Click the **"Review Code"** button.
5.  Wait for the analysis to complete. The results will be displayed below.
6.  You can export the results as a Markdown or TXT file using the buttons provided.

---

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

*This tool is for educational and demonstrational purposes. Always perform a manual review for critical applications.*
