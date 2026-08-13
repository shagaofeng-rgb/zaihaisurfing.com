import assert from 'node:assert/strict';
import test from 'node:test';
import {editorialSections, isListBlock, listItems} from '../src/lib/editorialContent';

test('editorial content preserves headings and list blocks without exposing fenced code', () => {
  const sections = editorialSections([
    '## What this means',
    '',
    'A practical summary for operators.',
    '',
    '- Check local rules',
    '- Brief every rider',
    '',
    '```html',
    '<script>alert("do not render")</script>',
    '```',
    '',
    '## Source context',
    'Use the cited source as context only.'
  ].join('\n'));

  assert.equal(sections.length, 2);
  assert.equal(sections[0].heading, 'What this means');
  assert.equal(sections[0].paragraphs[0], 'A practical summary for operators.');
  assert.equal(isListBlock(sections[0].paragraphs[1]), true);
  assert.deepEqual(listItems(sections[0].paragraphs[1]), ['Check local rules', 'Brief every rider']);
  assert.equal(sections.flatMap((section) => section.paragraphs).join('\n').includes('script'), false);
});

test('editorial content separates HTML headings and paragraphs from publishing plugins', () => {
  const sections = editorialSections('<h2>Selection factors</h2><p>Start with the operating environment.</p><p>Confirm local requirements before purchase.</p>');

  assert.equal(sections.length, 1);
  assert.equal(sections[0].heading, 'Selection factors');
  assert.deepEqual(sections[0].paragraphs, ['Start with the operating environment.', 'Confirm local requirements before purchase.']);
});
