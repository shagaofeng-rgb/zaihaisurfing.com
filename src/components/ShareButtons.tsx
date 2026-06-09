'use client';

import {useState} from 'react';

type ShareButtonsProps = {
  title: string;
};

const shareChannels = [
  {
    key: 'facebook',
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.2 8.1h2.2V4.4a29 29 0 0 0-3.2-.2c-3.2 0-5.4 1.9-5.4 5.5v3.1H4.3V17h3.5v7h4.4v-7h3.5l.6-4.2h-4.1v-2.7c0-1.2.3-2 2-2Z" />
      </svg>
    )
  },
  {
    key: 'twitter',
    label: 'X',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.3 2.7h3.4l-7.4 8.5L23 21.3h-6.8l-5.3-6.9-6.1 6.9H1.4l7.9-9L1 2.7h7l4.8 6.3 5.5-6.3Zm-1.2 16.8H19L7 4.4H5L17.1 19.5Z" />
      </svg>
    )
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.4 2h9.2A5.4 5.4 0 0 1 22 7.4v9.2a5.4 5.4 0 0 1-5.4 5.4H7.4A5.4 5.4 0 0 1 2 16.6V7.4A5.4 5.4 0 0 1 7.4 2Zm0 2A3.4 3.4 0 0 0 4 7.4v9.2A3.4 3.4 0 0 0 7.4 20h9.2a3.4 3.4 0 0 0 3.4-3.4V7.4A3.4 3.4 0 0 0 16.6 4H7.4Zm4.6 3.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Zm0 2a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Zm5-2.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" />
      </svg>
    )
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16.2 2c.4 3 2.1 4.8 5 5v4.1a8.7 8.7 0 0 1-5-1.6v7.1c0 3.6-2.3 6.2-5.9 6.2-3.1 0-5.6-2-5.6-5.1 0-3.7 3.6-6.1 7.3-5.2v4.3c-1.5-.5-3 .1-3 1.4 0 .9.8 1.5 1.7 1.5 1.1 0 1.8-.7 1.8-2.3V2h3.7Z" />
      </svg>
    )
  }
] as const;

export default function ShareButtons({title}: ShareButtonsProps) {
  const [status, setStatus] = useState('Share this product with your buyer team');

  async function copyLink(channel: string) {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setStatus(`Product link copied for ${channel}.`);
    } catch {
      setStatus('Copy failed. Please copy the browser URL manually.');
    }
  }

  function handleShare(channel: (typeof shareChannels)[number]['key']) {
    const url = window.location.href;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(`${title} | ZAIHAI SURFING`);

    if (channel === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'noopener,noreferrer');
      setStatus('Opening Facebook share window.');
      return;
    }

    if (channel === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank', 'noopener,noreferrer');
      setStatus('Opening X / Twitter share window.');
      return;
    }

    void copyLink(channel === 'instagram' ? 'Instagram' : 'TikTok');
  }

  return (
    <div className="share-panel" role="group" aria-label="Share product">
      <div>
        <strong>Share</strong>
        <p>{status}</p>
      </div>
      <div className="share-buttons">
        {shareChannels.map((channel) => (
          <button key={channel.key} type="button" className={`share-button ${channel.key}`} onClick={() => handleShare(channel.key)} aria-label={`Share on ${channel.label}`}>
            {channel.icon}
            <span>{channel.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
