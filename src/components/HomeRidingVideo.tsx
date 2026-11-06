'use client';

import {PlayIcon, XIcon} from '@phosphor-icons/react';
import {useRef, useState, type MouseEvent} from 'react';

type VideoLabels = {
  watch: string;
  title: string;
  close: string;
  loading: string;
  error: string;
  open: string;
};

const ridingVideo = '/assets/home-operations/riding-preview-640.mp4';
const fullVideo = '/assets/banners/zaihai-video-home-faststart.mp4';

export default function HomeRidingVideo({labels}: {labels: VideoLabels}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'ready' | 'loading' | 'error'>('ready');

  function open(event: MouseEvent<HTMLAnchorElement>) {
    const dialog = dialogRef.current;
    if (!dialog || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    dialog.showModal();
    setStatus('loading');
    setIsOpen(true);
  }

  function reset() {
    videoRef.current?.pause();
    setIsOpen(false);
    setStatus('ready');
  }

  return (
    <>
      <a className="operations-video-button" href={ridingVideo} target="_blank" rel="noopener noreferrer" onClick={open} aria-haspopup="dialog">
        <span aria-hidden="true"><PlayIcon size={12} weight="fill" /></span>
        {labels.watch}
      </a>
      <dialog
        className="operations-video-dialog"
        ref={dialogRef}
        aria-labelledby="riding-video-title"
        onClose={reset}
        onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}
      >
        <div className="operations-video-content">
          <div className="operations-video-heading">
            <h2 id="riding-video-title">{labels.title}</h2>
            <button type="button" aria-label={labels.close} onClick={() => dialogRef.current?.close()}>
              <XIcon size={22} aria-hidden="true" />
            </button>
          </div>
          {isOpen ? (
            <video
              ref={videoRef}
              controls
              autoPlay
              loop
              playsInline
              preload="metadata"
              poster="/assets/banners/zaihai-video-poster-optimized.jpg"
              onWaiting={() => setStatus('loading')}
              onCanPlay={() => setStatus('ready')}
              onError={() => setStatus('error')}
            >
              <source src={ridingVideo} type="video/mp4" />
              <source src={fullVideo} type="video/mp4" />
              <a href={fullVideo}>{labels.open}</a>
            </video>
          ) : null}
          {status === 'loading' ? <p role="status">{labels.loading}</p> : null}
          {status === 'error' ? <p role="status">{labels.error} <a href={fullVideo}>{labels.open}</a></p> : null}
        </div>
      </dialog>
    </>
  );
}
