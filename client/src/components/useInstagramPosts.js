import { useState, useEffect, useCallback } from 'react';

/**
 * Custom React hook for fetching Instagram posts from the backend API.
 * @param {number} limit - The maximum number of posts to fetch (default: 18).
 * @param {string} apiBaseUrl - The base URL of the API.
 * @returns {Object} { data, loading, loadingNextPage, error, source, hasNextPage, fetchNextPage }
 */
export function useInstagramPosts(limit = 18, apiBaseUrl = 'http://localhost:8080') {
    const [data, setData] = useState([]);
    const [source, setSource] = useState('live');
    const [loading, setLoading] = useState(true);
    const [loadingNextPage, setLoadingNextPage] = useState(false);
    const [error, setError] = useState(null);
    
    // Pagination state
    const [nextCursor, setNextCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(false);

    const fetchPosts = useCallback(async (after = null) => {
        try {
            if (after) {
                setLoadingNextPage(true);
            } else {
                setLoading(true);
            }
            setError(null);

            let url = `${apiBaseUrl}/api/instagram/posts?limit=${limit}`;
            if (after) url += `&after=${after}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (after) {
                setData(prev => [...prev, ...(result.posts || [])]);
            } else {
                setData(result.posts || []);
            }
            
            setSource(result.source || 'live');
            
            // Update pagination state
            if (result.paging && result.paging.cursors && result.paging.cursors.after) {
                setNextCursor(result.paging.cursors.after);
                setHasNextPage(!!result.paging.next);
            } else {
                setNextCursor(null);
                setHasNextPage(false);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            if (after) {
                setLoadingNextPage(false);
            } else {
                setLoading(false);
            }
        }
    }, [limit, apiBaseUrl]);

    // Initial fetch
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const fetchNextPage = useCallback(() => {
        if (hasNextPage && nextCursor && !loadingNextPage) {
            fetchPosts(nextCursor);
        }
    }, [fetchPosts, hasNextPage, nextCursor, loadingNextPage]);

    return { data, loading, loadingNextPage, error, source, hasNextPage, fetchNextPage };
}
