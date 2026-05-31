'use client';

import {useState} from 'react';

type ShareButtonsProps = {
  title: string;
};

const shareChannels = [
  {key: 'facebook', label: 'Facebook', short: 'f'},
  {key: 'twitter', label: 'X / Twitter', short: 'x'},
  {key: 'instagram', label: 'Instagram', short: 'ig'},
  {key: 'tiktok', label: 'TikTok', short: 'tt'}
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
    <div className="share-panel" aria-label="Share product">
      <div>
        <strong>Share</strong>
        <p>{status}</p>
      </div>
      <div className="share-buttons">
        {shareChannels.map((channel) => (
          <button key={channel.key} type="button" className={`share-button ${channel.key}`} onClick={() => handleShare(channel.key)} aria-label={`Share on ${channel.label}`}>
            <span>{channel.short}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
