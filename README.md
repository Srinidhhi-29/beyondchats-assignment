# BeyondChats – Full Stack Assignment

This repository contains my submission for the BeyondChats full-time remote engineering role.
The project demonstrates a Laravel backend, a Node.js automation worker, and a React frontend
working together to scrape, enrich, and display blog content.

---

##  Architecture Overview

BeyondChats Blogs
        ↓
Laravel Scraper (Phase 1)
        ↓
MySQL Database
        ↓
Laravel REST APIs
        ↓
Node.js Worker (Phase 2)
        ↓
Updated Article Stored
        ↓
React Frontend (Phase 3)

---

##  Phase 1 – Laravel Backend

- Scrapes the **last page** of BeyondChats blogs and stores the **5 oldest articles**
- Uses a Laravel Artisan command for scraping
- Articles stored with title, content, source URL, timestamps
- REST APIs:
  - GET /api/articles
  - GET /api/articles/latest
  - POST /api/articles

**Design decision:**  
Scraping logic is isolated in an Artisan command to keep controllers clean and reusable.

---

##  Phase 2 – Node.js Worker

- Fetches the latest article from Laravel API
- Searches the web using DuckDuckGo HTML (no API key required)
- Falls back gracefully if search is blocked
- Scrapes content from top-ranking articles
- Generates an updated version (LLM-style transformation)
- Publishes the updated article back to Laravel
- References are explicitly cited

**Trade-offs:**
- Used HTML scraping instead of Google API to avoid API keys
- LLM call mocked for assignment safety and reproducibility

---

##  Phase 3 – React Frontend

- Fetches articles from Laravel APIs
- Displays original and updated versions together
- Responsive and minimal UI
- Designed for clarity over styling complexity

---

##  Local Setup Instructions

### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan scrape:beyondchats
php artisan serve

```

### 2. NodeJS Worker
- Search engine HTML scraping may be throttled occasionally; the worker uses defensive selectors and gracefully skips updates if no valid competitor articles are found.
```bash
cd node-worker
npm install
node index.js
```

### 3. Frontend (React)
```bash
cd frontend
npm install
npm start
```

---

## Notes
- Google search uses **SerpAPI** (replace API key).
- LLM uses **OpenAI-compatible API** (replace key).
- Scraping logic is intentionally simple and readable.

---

## Live Link
(Deploy React on Vercel / Netlify and paste link here)

