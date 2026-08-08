export type EditorialSection = {
  heading: string;
  paragraphs: string[];
};

function cleanText(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/(\*\*|__|`)/g, '')
    .replace(/\r/g, '')
    .trim();
}

function isHeading(value: string) {
  const match = value.match(/^#{1,3}\s+(.+)$/);
  return match ? cleanText(match[1]) : '';
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

  for (const rawLine of content.replace(/```[\s\S]*?```/g, '').split('\n')) {
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
