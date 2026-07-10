const exactProductPattern = /\b(electric surfboard|jetboard|jet board|e-?foil|personal watercraft|pwc|marine battery|go-?kart boat|water sports?|watersports?)\b/i;
const aquaticPattern = /\b(boat|boating|marine|marina|waterfront|surf|yacht|beach|lake|coastal|ocean|island|aquatic)\b/i;
const commercialPattern = /\b(resort|tourism|rental|equipment|battery|technology|regulation|safety|market|investment|operator|dealer|distributor|fleet|show|expo|launch|innovation)\b/i;
const unrelatedPattern = /\b(diagnosis|disease|patient|medical|medicine|celebrity|election|parliament|football|basketball|cryptocurrency|stock picks?)\b/i;

export function isRelevantNewsText(title: string, summary = '') {
  const text = `${title} ${summary}`.replace(/<[^>]+>/g, ' ');
  if (exactProductPattern.test(text)) return true;
  if (unrelatedPattern.test(text)) return false;
  return aquaticPattern.test(text) && commercialPattern.test(text);
}

export function automatedNewsSourceText(title: string, excerpt: string, content: string) {
  return {
    title: content.match(/source item ["“]([^"”]+)["”]/i)?.[1]
      || title.replace(/^.*?(Market Signal|Safety Signal):\s*/i, ''),
    summary: content.match(/Source summary:\s*([^\n]+)/i)?.[1] || excerpt
  };
}
