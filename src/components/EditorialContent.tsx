import {isListBlock, listItems, type EditorialSection} from '@/lib/editorialContent';

export function EditorialContent({sections}: {sections: EditorialSection[]}) {
  return <>{sections.map((section, sectionIndex) => (
    <section className="editorial-section" key={`${section.heading}-${sectionIndex}`}>
      <h2>{section.heading}</h2>
      {section.paragraphs.map((paragraph, index) => isListBlock(paragraph)
        ? <ul className="editorial-list" key={`${section.heading}-list-${index}`}>{listItems(paragraph).map((item) => <li key={item}>{item}</li>)}</ul>
        : <p key={`${section.heading}-paragraph-${index}`}>{paragraph}</p>
      )}
    </section>
  ))}</>;
}
