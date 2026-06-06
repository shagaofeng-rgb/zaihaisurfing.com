import {socialLinks} from '@/config/socialLinks';

export default function SocialLinks() {
  if (!socialLinks.length) return null;

  return (
    <div className="social-links" aria-label="Social media links">
      {socialLinks.map((item) => (
        <a
          className="social-link"
          href={item.url}
          key={item.name}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.name}
        >
          <SocialIcon name={item.icon} />
        </a>
      ))}
    </div>
  );
}

function SocialIcon({name}: {name: 'facebook' | 'instagram' | 'linkedin'}) {
  if (name === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.2 8.1V6.6c0-.7.5-.9 1-.9h2.1V2.2L14.4 2c-3.2 0-4.9 1.9-4.9 5.3v.8H6.7v3.9h2.8V22h4.2V12h3.1l.5-3.9h-3.1Z" />
      </svg>
    );
  }

  if (name === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.3 2h9.4A5.3 5.3 0 0 1 22 7.3v9.4a5.3 5.3 0 0 1-5.3 5.3H7.3A5.3 5.3 0 0 1 2 16.7V7.3A5.3 5.3 0 0 1 7.3 2Zm0 2A3.3 3.3 0 0 0 4 7.3v9.4A3.3 3.3 0 0 0 7.3 20h9.4a3.3 3.3 0 0 0 3.3-3.3V7.3A3.3 3.3 0 0 0 16.7 4H7.3Zm4.7 3.3A4.7 4.7 0 1 1 12 16.7 4.7 4.7 0 0 1 12 7.3Zm0 2A2.7 2.7 0 1 0 12 14.7 2.7 2.7 0 0 0 12 9.3Zm5-2.5a1.1 1.1 0 1 1-1.1 1.1A1.1 1.1 0 0 1 17 6.8Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 8.8H2.8V22h3.7V8.8ZM4.7 2A2.1 2.1 0 1 0 4.7 6.2 2.1 2.1 0 0 0 4.7 2Zm7.8 6.8H8.9V22h3.7v-6.6c0-1.8.3-3.5 2.5-3.5s2.2 2 2.2 3.6V22H21v-7.4c0-3.6-.8-6.3-4.9-6.3a4.3 4.3 0 0 0-3.8 2.1h-.1l.1-1.6Z" />
    </svg>
  );
}
