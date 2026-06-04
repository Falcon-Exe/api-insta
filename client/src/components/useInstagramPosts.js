import { useState, useEffect } from 'react';

/**
 * Custom React hook for fetching Instagram posts from the backend API.
 * @param {number} limit - The maximum number of posts to fetch (default: 18).
 * @param {string} apiBaseUrl - The base URL of the API.
 * @returns {Object} { data, loading, error, source }
 */
export function useInstagramPosts(limit = 18, apiBaseUrl = 'http://localhost:3000') {
    const [data, setData] = useState([]);
    const [source, setSource] = useState('live');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchPosts() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${apiBaseUrl}/api/instagram/posts?limit=${limit}`);

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();

                if (isMounted) {
                    setData(result.posts || []);
                    setSource(result.source || 'live');
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message);
                    // Don't override data here to allow fallback display if we already had data
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchPosts();

        return () => {
            isMounted = false;
        };
    }, [limit, apiBaseUrl]);

    return { data, loading, error, source };
}
