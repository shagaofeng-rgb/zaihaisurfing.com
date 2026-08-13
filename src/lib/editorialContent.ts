export type EditorialSection = {
  heading: string;
  paragraphs: string[];
};

function cleanText(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/(p|div|h[1-6]|blockquote)>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/(\*\*|__|`)/g, '')
    .replace(/\r/g, '')
    .trim();
}

function isHeading(value: string) {
  const match = value.match(/^#{1,3}\s+(.+)$/);
  if (match) return cleanText(match[1]);
  const plain = cleanText(value).replace(/:$/, '');
  return /^(key )?takeaways?|introduction|overview|buyer context|selection factors|what to consider|next steps|conclusion|faq$/i.test(plain) ? plain : '';
}

function isListItem(value: string) {
  return /^[-*+]\s+/.test(value) || /^\d+[.)]\s+/.test(value);
}

function listValue(value: string) {
  return cleanText(value.replace(/^([-*+]|\d+[.)])\s+/, ''));
}

export function editorialSections(content: string, fallbackHeading = 'Overview'): EditorialSection[] {
  const sections: EditorialSection[] = [];
  let heading = fallbackHeading;
  let lines: string[] = [];
  const normalizedContent = content
    .replace(/<(h[1-3])[^>]*>([\s\S]*?)<\/\1>/gi, (_match, _tag, headingText) => `\n## ${headingText}\n`)
    .replace(/<\/(p|div|blockquote)>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n');

  const flush = () => {
    const paragraphs: string[] = [];
    let buffer: string[] = [];
    const flushBuffer = () => {
      const value = cleanText(buffer.join(' '));
      if (value) paragraphs.push(value);
      buffer = [];
    };

    for (const rawLine of lines) {
      const line = cleanText(rawLine);
      if (!line) {
        flushBuffer();
        continue;
      }
      if (isListItem(line)) {
        flushBuffer();
        const previous = paragraphs.at(-1);
        const item = listValue(line);
        if (previous?.startsWith('::list::')) paragraphs[paragraphs.length - 1] = `${previous}\n${item}`;
        else paragraphs.push(`::list::${item}`);
        continue;
      }
      buffer.push(line);
    }
    flushBuffer();
    if (paragraphs.length) sections.push({heading, paragraphs});
    lines = [];
  };

  for (const rawLine of normalizedContent.replace(/```[\s\S]*?```/g, '').split('\n')) {
    const nextHeading = isHeading(rawLine.trim());
    if (nextHeading) {
      flush();
      heading = nextHeading;
    } else {
      lines.push(rawLine);
    }
  }
  flush();
  return sections.length ? sections : [{heading: fallbackHeading, paragraphs: [cleanText(content) || fallbackHeading]}];
}

export function listItems(value: string) {
  return value.replace(/^::list::/, '').split('\n').map((item) => item.trim()).filter(Boolean);
}

export function isListBlock(value: string) {
  return value.startsWith('::list::');
}
