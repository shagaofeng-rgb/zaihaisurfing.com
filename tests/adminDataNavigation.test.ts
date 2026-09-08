import assert from 'node:assert/strict';
import test from 'node:test';
import {pageHref, paginate, parseAdminPagination} from '../src/lib/adminPagination';
import {isAdminTimestampInRange, parseAdminTimeFilter} from '../src/lib/adminTimeFilter';

test('admin pagination uses supported page sizes and clamps result pages', () => {
  assert.deepEqual(parseAdminPagination({page: '3', perPage: '20'}), {page: 3, perPage: 20});
  assert.deepEqual(parseAdminPagination({sourcePage: '2', sourcePerPage: '50'}, 'sourcePage', 'sourcePerPage'), {page: 2, perPage: 50});
  const result = paginate([1, 2, 3], 99, 10);
  assert.equal(result.page, 1);
  assert.deepEqual(result.items, [1, 2, 3]);
});

test('pagination links preserve filters and isolate named paginators', () => {
  const href = pageHref(
    '/admin/news-autopilot',
    {range: 'month', candidatePage: '2', candidatePerPage: '20', runPage: '3'},
    {candidatePage: 4, candidatePerPage: 20},
    'candidatePage',
    'candidatePerPage'
  );
  const url = new URL(href, 'https://example.com');
  assert.equal(url.searchParams.get('range'), 'month');
  assert.equal(url.searchParams.get('runPage'), '3');
  assert.equal(url.searchParams.get('candidatePage'), '4');
  assert.equal(url.searchParams.get('candidatePerPage'), '20');
});

test('custom admin time filters use Asia Shanghai day boundaries', () => {
  const filter = parseAdminTimeFilter({range: 'custom', start: '2026-09-01', end: '2026-09-08'});
  assert.equal(filter.timezone, 'Asia/Shanghai');
  assert.equal(filter.from.toISOString(), '2026-08-31T16:00:00.000Z');
  assert.equal(filter.to.toISOString(), '2026-09-08T15:59:59.999Z');
  assert.equal(isAdminTimestampInRange('2026-09-08T15:59:59.999Z', filter.from, filter.to), true);
  assert.equal(isAdminTimestampInRange('2026-09-08T16:00:00.000Z', filter.from, filter.to), false);
});
