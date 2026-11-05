import {isListBlock, listItems, type EditorialSection} from '@/lib/editorialContent';

export function EditorialContent({sections}: {sections: EditorialSection[]}) {
  return <>{sections.map((section, sectionIndex) => (
    <section id={`article-topic-${sectionIndex+1}`} className="editorial-section" key={`${section.heading}-${sectionIndex}`}>
      <h2>{section.heading}</h2>
      {section.paragraphs.map((paragraph, index) => isListBlock(paragraph)
        ? <ul className="editorial-list" key={`${section.heading}-list-${index}`}>{listItems(paragraph).map((item) => <li key={item}>{item}</li>)}</ul>
        : <p key={`${section.heading}-paragraph-${index}`}>{paragraph}</p>
      )}
    </section>
  ))}</>;
}

export function ArticleContents({sections, mobile = false}: {sections: EditorialSection[]; mobile?: boolean}) {
  if (!sections.length) return null;
  const links = sections.map(({heading}, index) =>
    <a key={index} href={`#article-topic-${index+1}`}>{heading}</a>
  );
  return mobile
    ? <details className="article-contents-mobile"><summary>On this page</summary>{links}</details>
    : <nav className="article-contents" aria-label="On this page"><strong>On this page</strong>{links}</nav>;
}
