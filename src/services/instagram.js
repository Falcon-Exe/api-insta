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
 * @param {string|null} after - Cursor for pagination.
 * @returns {Promise<{ posts: Object[], paging: Object, source: string }>}
 */
async function getPosts(limit = 18, after = null) {
    const now = Date.now();
    const cacheKey = after || 'first_page';

    // 1. Check in-memory cache
    if (!cache[cacheKey]) {
        cache[cacheKey] = { data: null, timestamp: null, paging: null };
    }
    
    const pageCache = cache[cacheKey];

    if (pageCache.data && pageCache.timestamp && (now - pageCache.timestamp) < CACHE_TTL_MS) {
        return {
            posts: pageCache.data.slice(0, limit),
            paging: pageCache.paging,
            source: 'cache'
        };
    }

    // 2. Fetch from Live API
    if (validateEnv()) {
        try {
            let url = `https://graph.instagram.com/${IG_USER_ID}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,children{media_url,media_type,thumbnail_url}&access_token=${IG_TOKEN}&limit=${limit}`;
            if (after) {
                url += `&after=${after}`;
            }

            const response = await axios.get(url);
            const rawPosts = response.data.data;
            const pagingInfo = response.data.paging || null;

            // Transform data securely
            const transformedPosts = rawPosts.map(post => {
                const isVideo = post.media_type === 'VIDEO';
                const hasChildren = post.media_type === 'CAROUSEL_ALBUM' && post.children && post.children.data;
                
                let children = [];
                if (hasChildren) {
                    children = post.children.data.map(child => ({
                        id: child.id,
                        media_type: child.media_type,
                        url: child.media_type === 'VIDEO' ? child.thumbnail_url : child.media_url,
                        videoUrl: child.media_type === 'VIDEO' ? child.media_url : null
                    }));
                }

                return {
                    id: post.id,
                    media_type: post.media_type,
                    url: isVideo ? post.thumbnail_url : post.media_url,
                    videoUrl: isVideo ? post.media_url : null,
                    alt: post.caption || 'Instagram Post',
                    link: post.permalink,
                    children: children
                };
            });

            // Update Cache
            pageCache.data = transformedPosts;
            pageCache.timestamp = now;
            pageCache.paging = pagingInfo;

            // Update Fallback File Cache (only for first page to be safe)
            if (!after) {
                saveFallbackCache({ posts: transformedPosts, paging: pagingInfo });
            }

            return {
                posts: transformedPosts,
                paging: pagingInfo,
                source: 'live'
            };
        } catch (error) {
            console.error('Instagram API Error:', error.response?.data?.error?.message || error.message);
        }
    }

    // 3. Fallback to Local File Cache if Live API fails or no env setup
    if (!after) {
        console.log('Attempting to serve posts from fallback cache...');
        const fallbackData = readFallbackCache();

        if (fallbackData && fallbackData.posts) {
            return {
                posts: fallbackData.posts.slice(0, limit),
                paging: fallbackData.paging || null,
                source: 'fallback'
            };
        }
    }

    // 4. Return Empty Fallback if nothing is available
    console.error('No fallback data available.');
    return {
        posts: [],
        paging: null,
        source: 'fallback' /* Still returning fallback state but with empty posts */
    };
}

module.exports = {
    getPosts,
    refreshToken
};
