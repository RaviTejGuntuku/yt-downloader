# YT Downloader

A simple, mobile-optimized YouTube video downloader built with Next.js and Python (yt-dlp).

## Deploy to Vercel

1. Push this project to a GitHub repository

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Deploy - Vercel will automatically detect the Next.js frontend and Python API

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.12+

### Setup

```bash
# Install Node dependencies
npm install

# Install Python dependencies (for local API testing)
pip install yt-dlp

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Note:** The Python API (`/api/download`) only works when deployed to Vercel or using `vercel dev` locally.

### Using Vercel CLI for local development

```bash
npm install -g vercel
vercel dev
```

This will run both the Next.js frontend and Python API locally.

## Project Structure

```
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main page component
│   └── globals.css      # Styles
├── api/
│   └── download.py      # Python API with yt-dlp
├── requirements.txt     # Python dependencies
├── vercel.json          # Vercel configuration
└── package.json
```
