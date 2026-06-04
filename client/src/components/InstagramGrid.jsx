import React from 'react';
import { useInstagramPosts } from './useInstagramPosts';
import './InstagramGrid.css'; // Ensure you import the styles

/**
 * InstagramGrid component displays a dark-mode responsive grid of Instagram posts.
 * Utilizes the useInstagramPosts hook.
 */
export default function InstagramGrid({ limit = 9, apiBaseUrl }) {
    const { data: posts, loading, error, source } = useInstagramPosts(limit, apiBaseUrl);

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
                <div className="ig-grid">
                    {posts.map((post) => (
                        <a
                            key={post.id}
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ig-post-card"
                            aria-label={`View Instagram post: ${post.alt || 'Open link'}`}
                        >
                            <div className="ig-image-container">
                                <img src={post.url} alt={post.alt || 'Instagram content'} loading="lazy" />
                                <div className="ig-overlay">
                                    {post.alt && <p className="ig-caption">{post.alt}</p>}
                                    <span className="ig-icon" aria-hidden="true">View on Instagram</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}

            {!loading && !error && posts.length === 0 && (
                <div className="ig-empty">No posts available at the moment.</div>
            )}
        </div>
    );
}
