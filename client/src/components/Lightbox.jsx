import React, { useState, useEffect } from 'react';

export default function Lightbox({ post, initialIndex = 0, onClose }) {
    const [index, setIndex] = useState(initialIndex);

    useEffect(() => {
        setIndex(initialIndex);
    }, [initialIndex, post]);

    // Handle escape key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext(e);
            if (e.key === 'ArrowLeft') handlePrev(e);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    if (!post) return null;

    const isCarousel = post.children && post.children.length > 0;
    const currentMedia = isCarousel ? post.children[index] : post;
    const isVideo = !!currentMedia.videoUrl;

    const handleNext = (e) => {
        if (e) e.stopPropagation();
        if (isCarousel) setIndex((prev) => (prev + 1) % post.children.length);
    };

    const handlePrev = (e) => {
        if (e) e.stopPropagation();
        if (isCarousel) setIndex((prev) => (prev - 1 + post.children.length) % post.children.length);
    };

    return (
        <div className="ig-lightbox" onClick={onClose}>
            <button className="ig-lightbox-close" aria-label="Close" onClick={onClose}>&times;</button>
            
            <div className="ig-lightbox-content" onClick={e => e.stopPropagation()}>
                <div className="ig-lightbox-media">
                    {isVideo ? (
                        <video src={currentMedia.videoUrl} controls autoPlay loop playsInline className="ig-lightbox-video" />
                    ) : (
                        <img src={currentMedia.url} alt={post.alt} className="ig-lightbox-img" />
                    )}

                    {isCarousel && post.children.length > 1 && (
                        <>
                            <button onClick={handlePrev} className="ig-lightbox-btn prev" aria-label="Previous">‹</button>
                            <button onClick={handleNext} className="ig-lightbox-btn next" aria-label="Next">›</button>
                        </>
                    )}
                </div>
                <div className="ig-lightbox-sidebar">
                    <p className="ig-lightbox-caption">{post.alt}</p>
                    <a href={post.link} target="_blank" rel="noopener noreferrer" className="ig-lightbox-link">Open in Instagram</a>
                </div>
            </div>
        </div>
    );
}
