# Instagram Feed API System

A production-ready middleware API that securely connects a React frontend with the Instagram Graph API. Provides live feeds, caching, responsive fallback states, and pagination support.

## Features
- **Secure Backend Integration**: Express API fetching strictly server-side — keeping Instagram tokens hidden from users.
- **In-Memory Cache**: Defends against API rate limits by caching posts for 60 seconds.
- **Resilient Fallback**: Uses local file caching (`fallback-cache.json`) to serve posts even if the Instagram Graph API goes down or credentials expire.
- **Rate-Limiting & Security**: Implements `express-rate-limit` and restrictive CORS policies out of the box.
- **React Frontend Hook & Component**: Ready-to-use custom React hook and a dark-mode responsive Grid layout demonstrating integration best practices.
- **Serverless Ready**: Out-of-the-box support for deploying on Vercel.

---

## Getting Started

### 1. Requirements
- Node.js `^18.0.0` or higher
- An Instagram Standard or Professional Account
- An Instagram App registered in the Meta Developer Portal with `instagram_graph_user_profile` and `instagram_graph_user_media` scopes.

### 2. Installation
Clone or navigate to the repository directory and install dependencies:
```bash
cd YOUR_PROJECT_DIRECTORY
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your credentials (see `.env.example`):
```env
IG_USER_ID=your_instagram_user_id
IG_TOKEN=your_long_lived_access_token
PORT=3000
```

### 4. Running Locally
Start the server in development mode:
```bash
npm run dev
```
The API will be available at `http://localhost:3000/api/instagram/posts`. 

You can test pagination by passing the limit query parameter: `http://localhost:3000/api/instagram/posts?limit=10`.

---

## Integrating The Frontend

You'll find the React hook and dark-mode component in the `frontend/` directory. Simply drop them into your Next.js, Create-React-App, or Vite project.

1. **Copy Files**: Copy `useInstagramPosts.js`, `InstagramGrid.jsx`, and `InstagramGrid.css` into your React project.
2. **Usage**:
```jsx
// App.jsx
import React from 'react';
import InstagramGrid from './components/InstagramGrid';

function App() {
  return (
    <div className="app-container">
      {/* Configure the API base URL based on your backend host */}
      <InstagramGrid limit={9} apiBaseUrl="http://localhost:3000" />
    </div>
  );
}

export default App;
```

---

## Deployment (Vercel)

This repository is pre-configured to deploy easily as a serverless API on Vercel utilizing the included `vercel.json` configuration.

1. Push your code to GitHub, GitLab, or Bitbucket.
2. Create a new project in the Vercel Dashboard and import the repository.
3. Add the `IG_USER_ID` and `IG_TOKEN` under the **Environment Variables** section in the Vercel project settings.
4. Deploy the project.

Your API endpoint will now be live on `https://your-vercel-app-url.vercel.app/api/instagram/posts`.

---

## Architecture Overview

- **api/index.js**: Express server setup, CORS, rate limiting, and route definitions. Designed to work well with serverless environments.
- **src/services/instagram.js**: Core service logic validating the token, fetching the Graph API, tracking the 60s in-memory cache, and caching fallback data to the local disk.
- **frontend/**: Complete React examples integrating smoothly with the backend's strict response payload structure.

