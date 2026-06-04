import React, { useState, useRef } from 'react';

export default function InstagramCard({ post, onClick }) {
    const [hover, setHover] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);
    const videoRef = useRef(null);

    const isCarousel = post.children && post.children.length > 0;
    const currentMedia = isCarousel ? post.children[imageIndex] : post;
    const isVideo = !!currentMedia.videoUrl;

    const handleNext = (e) => {
        e.stopPropagation();
        if (isCarousel) setImageIndex((prev) => (prev + 1) % post.children.length);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        if (isCarousel) setImageIndex((prev) => (prev - 1 + post.children.length) % post.children.length);
    };

    const handleMouseEnter = () => {
        setHover(true);
        if (videoRef.current) {
            videoRef.current.play().catch(() => console.log('Autoplay prevented'));
        }
    };

    const handleMouseLeave = () => {
        setHover(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <div 
            className="ig-post-card"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onClick(post, imageIndex)}
            role="button"
            tabIndex={0}
        >
            <div className="ig-image-container">
                {isVideo && hover ? (
                    <video 
                        ref={videoRef}
                        src={currentMedia.videoUrl} 
                        muted 
                        loop 
                        playsInline
                        className="ig-video-player" 
                    />
                ) : (
                    <img src={currentMedia.url} alt={post.alt} loading="lazy" className="ig-image" />
                )}

                {isCarousel && hover && post.children.length > 1 && (
                    <div className="ig-carousel-controls">
                        <button onClick={handlePrev} className="ig-carousel-btn" aria-label="Previous image">‹</button>
                        <button onClick={handleNext} className="ig-carousel-btn" aria-label="Next image">›</button>
                        <div className="ig-carousel-dots">
                            {post.children.map((_, i) => (
                                <span key={i} className={`ig-dot ${i === imageIndex ? 'active' : ''}`} />
                            ))}
                        </div>
                    </div>
                )}

                {isCarousel && !hover && (
                    <div className="ig-carousel-indicator">
                        <svg viewBox="0 0 48 48" width="24" height="24" fill="white">
                            <path d="M34.5 16h-21C11.6 16 10 17.6 10 19.5v17c0 1.9 1.6 3.5 3.5 3.5h21c1.9 0 3.5-1.6 3.5-3.5v-17c0-1.9-1.6-3.5-3.5-3.5zm-2.5 16H16v-11h16v11zm6.5-19.5v17c0 1.5-1.2 2.7-2.7 2.7H36V19.5c0-3.3-2.7-6-6-6H14.8c0-1.5 1.2-2.7 2.7-2.7h21c1.9 0 3.5 1.6 3.5 3.5z"/>
                        </svg>
                    </div>
                )}

                {isVideo && !hover && (
                    <div className="ig-video-indicator">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="white" opacity="0.8">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                )}

                <div className="ig-overlay">
                    {post.alt && <p className="ig-caption">{post.alt}</p>}
                </div>
            </div>
        </div>
    );
}
