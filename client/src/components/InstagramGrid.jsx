import React, { useState } from 'react';
import { useInstagramPosts } from './useInstagramPosts';
import InstagramCard from './InstagramCard';
import Lightbox from './Lightbox';
import './InstagramGrid.css';

/**
 * InstagramGrid component displays a dark-mode responsive grid of Instagram posts.
 * Utilizes the useInstagramPosts hook with pagination support.
 */
export default function InstagramGrid({ limit = 9, apiBaseUrl }) {
    const { data: posts, loading, loadingNextPage, error, source, hasNextPage, fetchNextPage } = useInstagramPosts(limit, apiBaseUrl);
    
    // Lightbox state
    const [selectedPost, setSelectedPost] = useState(null);
    const [initialImageIndex, setInitialImageIndex] = useState(0);

    const handleCardClick = (post, imageIndex) => {
        setSelectedPost(post);
        setInitialImageIndex(imageIndex);
    };

    const getSourceBadgeColor = (sourceStr) => {
        switch (sourceStr) {
            case 'cache': return '#f59e0b'; // amber
            case 'fallback': return '#ef4444'; // red
            case 'live':
            default: return '#10b981'; // green
        }
    };

    return (
        <div className="ig-container">
            <header className="ig-header">
                <h2 className="ig-title">Latest Instagram Posts</h2>
                <div className="ig-status">
                    Status: <span style={{ color: getSourceBadgeColor(source) }}>{source.toUpperCase()}</span>
                </div>
            </header>

            {error && !posts.length && (
                <div className="ig-error">
                    <p>Failed to load posts: {error}</p>
                </div>
            )}

            {loading && !posts.length ? (
                <div className="ig-grid" aria-busy="true" aria-label="Loading posts">
                    {Array.from({ length: limit }).map((_, i) => (
                        <div key={i} className="ig-post-card ig-skeleton"></div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="ig-grid">
                        {posts.map((post) => (
                            <InstagramCard 
                                key={post.id} 
                                post={post} 
                                onClick={handleCardClick} 
                            />
                        ))}
                    </div>
                    
                    {hasNextPage && (
                        <div className="ig-load-more-container">
                            <button 
                                className="ig-load-more-btn" 
                                onClick={fetchNextPage}
                                disabled={loadingNextPage}
                            >
                                {loadingNextPage ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            )}

            {!loading && !error && posts.length === 0 && (
                <div className="ig-empty">No posts available at the moment.</div>
            )}

            {selectedPost && (
                <Lightbox 
                    post={selectedPost} 
                    initialIndex={initialImageIndex}
                    onClose={() => setSelectedPost(null)} 
                />
            )}
        </div>
    );
}
