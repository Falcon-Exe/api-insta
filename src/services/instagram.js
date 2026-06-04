const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const IG_TOKEN = process.env.IG_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds
const FALLBACK_FILE_PATH = path.join(process.cwd(), 'fallback-cache.json');

// In-memory cache variables
let cache = {
    data: null,
    timestamp: null
};

/**
 * Validates if the required environment variables are set.
 */
function validateEnv() {
    if (!IG_TOKEN || !IG_USER_ID) {
        console.warn('WARNING: IG_TOKEN or IG_USER_ID not found in environment.');
        return false;
    }
    return true;
}

/**
 * Saves fallback data to the filesystem.
 * @param {Object} data - The validated posts data
 */
function saveFallbackCache(data) {
    try {
        fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(data), 'utf8');
    } catch (err) {
        console.error('Failed to write fallback cache:', err.message);
    }
}

/**
 * Reads fallback data from the filesystem.
 */
function readFallbackCache() {
    try {
        if (fs.existsSync(FALLBACK_FILE_PATH)) {
            const fileData = fs.readFileSync(FALLBACK_FILE_PATH, 'utf8');
            if (!fileData.trim()) return null;
            return JSON.parse(fileData);
        }
    } catch (err) {
        console.error('Failed to read fallback cache:', err.message);
    }
    return null;
}

/**
 * Prepares the token refresh logic.
 * Call this function to refresh long-lived access tokens periodically.
 */
async function refreshToken() {
    try {
        const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${IG_TOKEN}`;
        const response = await axios.get(url);
        // Ideally update standard secure store / env with new token here
        console.log('Token successfully refreshed.');
        return response.data.access_token;
    } catch (error) {
        console.error('Failed to refresh token:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Fetches Instagram posts using either the Live API, In-Memory Cache, or Fallback File.
 * @param {number} limit - Maximum number of posts to return.
 * @returns {Promise<{ posts: Object[], source: string }>}
 */
async function getPosts(limit = 18) {
    const now = Date.now();

    // 1. Check in-memory cache
    if (cache.data && cache.timestamp && (now - cache.timestamp) < CACHE_TTL_MS) {
        return {
            posts: cache.data.slice(0, limit),
            source: 'cache'
        };
    }

    // 2. Fetch from Live API
    if (validateEnv()) {
        try {
            const url = `https://graph.instagram.com/${IG_USER_ID}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url&access_token=${IG_TOKEN}`;
            const response = await axios.get(url);

            const rawPosts = response.data.data;

            // Transform data securely
            const transformedPosts = rawPosts.map(post => ({
                id: post.id,
                url: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
                alt: post.caption || 'Instagram Post',
                link: post.permalink
            }));

            // Update Cache
            cache.data = transformedPosts;
            cache.timestamp = now;

            // Update Fallback File Cache
            saveFallbackCache(transformedPosts);

            return {
                posts: transformedPosts.slice(0, limit),
                source: 'live'
            };
        } catch (error) {
            console.error('Instagram API Error:', error.response?.data?.error?.message || error.message);
        }
    }

    // 3. Fallback to Local File Cache if Live API fails or no env setup
    console.log('Attempting to serve posts from fallback cache...');
    const fallbackData = readFallbackCache();

    if (fallbackData) {
        return {
            posts: fallbackData.slice(0, limit),
            source: 'fallback'
        };
    }

    // 4. Return Empty Fallback if nothing is available
    console.error('No fallback data available.');
    return {
        posts: [],
        source: 'fallback' /* Still returning fallback state but with empty posts */
    };
}

module.exports = {
    getPosts,
    refreshToken
};
