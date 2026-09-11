'use client';

import {useEffect, useRef, useState} from 'react';

export default function HomeRidingVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'ready' | 'loading' | 'error'>('ready');

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    const video = videoRef.current;
    setStatus('loading');
    video.load();
    void video.play().then(() => setStatus('ready')).catch(() => setStatus('error'));
  }, [isOpen]);

  function close() {
    videoRef.current?.pause();
    setIsOpen(false);
    setStatus('ready');
  }

  return (
    <>
      <button className="ocean-button ocean-button-ghost" type="button" onClick={() => setIsOpen(true)}>
        Watch riding video
      </button>
      {isOpen ? (
        <div className="ocean-video-dialog" role="dialog" aria-modal="true" aria-labelledby="riding-video-title" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <section className="ocean-video-frame">
            <div className="ocean-video-head">
              <div><p>ON THE WATER</p><h2 id="riding-video-title">Riding in motion</h2></div>
              <button type="button" onClick={close}>Close</button>
            </div>
            <video
              ref={videoRef}
              controls
              loop
              playsInline
              preload="metadata"
              poster="/assets/banners/zaihai-video-poster-optimized.jpg"
              onWaiting={() => setStatus('loading')}
              onCanPlay={() => setStatus('ready')}
              onError={() => setStatus('error')}
            >
              <source src="/assets/banners/zaihai-home-hero-preview.mp4" type="video/mp4" />
              <source src="/assets/banners/zaihai-video-home-faststart.mp4" type="video/mp4" />
              Your browser does not support HTML video.
            </video>
            <p className="ocean-video-status" aria-live="polite">
              {status === 'loading' ? 'Loading video…' : status === 'error' ? 'The video could not be played. Please try again or contact us for a copy.' : 'Streaming a browser-compatible H.264 video.'}
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}
