# ResearchAI

An AI-powered Research Companion helping researchers identify domains, analyze papers, and find research gaps using Gemini 2.0 Flash.

## Features

- **Beginner Mode**: Get research domain suggestions based on interest and skill level.
- **Paper Analysis**: Upload PDF papers to extract problems, claims, and limitations.
- **Research Synthesis**: AI synthesizes multiple papers to find common assumptions, conflicts, and propose novel research directions.

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    GEMINI_API_KEY=your_google_gemini_api_key_here
    ```
    Get your key from [Google AI Studio](https://aistudio.google.com/).

3.  **Run Application**
    Start both the backend API and frontend:
    ```bash
    npm run dev
    ```
    - Frontend: `http://localhost:5173`
    - Backend: `http://localhost:3001`

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **AI**: Google Gemini API (`gemini-2.0-flash`)
- **PDF Parsing**: `pdfjs-dist`
