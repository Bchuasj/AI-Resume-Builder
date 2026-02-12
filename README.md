# Resume AI Builder

A smart resume builder that tailors your CV to specific job descriptions using Google's Gemini AI, ensuring ATS compatibility.

<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Features

- **AI-Powered Optimization**: Uses Google Gemini to rewrite your resume for specific job descriptions.
- **ATS Friendly**: Generates clean, standard Markdown/PDF formats.
- **Real-time Preview**: See changes as they happen.
- **Privacy First**: Your API keys and data stay local.

## Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Bchuasj/AI-Resume-Builder.git
    cd AI-Resume-Builder
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` or `.env.local` file in the root directory:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

## Usage

1.  **Start the development server:**
    ```bash
    npm run dev
    ```

2.  **Open your browser:**
    Navigate to `http://localhost:5173`.

3.  **Build specific resumes:**
    - Upload your base resume (PDF/Text).
    - Paste a job description.
    - Click "Generate".

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS
- **AI**: Google Gemini (via `@google/genai`)
- **Icons**: Lucide React
- **PDF Generation**: html2pdf.js
