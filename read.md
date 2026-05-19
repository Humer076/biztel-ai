# BiztelAI Workflow Automation System

AI-powered document processing for manufacturing operational workflows.

## Features
- Upload images/PDFs
- AI-based data extraction using GPT-4 Vision
- Editable review workflow with confidence scores
- Validation rules and duplicate detection
- Dashboard with analytics (shift/machine summaries)
- Search & history

## Tech Stack
- Backend: Node.js, Express, SQLite
- Frontend: React, Tailwind CSS, Recharts
- AI: OpenAI GPT-4o-mini Vision API

## Setup

1. Clone repository
2. Copy `.env.example` to `.env` in backend folder and add your OpenAI API key
3. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd .. && npm install