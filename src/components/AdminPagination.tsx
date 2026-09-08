import {ADMIN_PAGE_SIZES, pageHref} from '@/lib/adminPagination';

function visiblePages(page: number, totalPages: number) {
  const pages = new Set([1, totalPages, page - 2, page - 1, page, page + 1, page + 2]);
  return [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
}

export default function AdminPagination({
  basePath,
  params,
  page,
  perPage,
  total,
  totalPages,
  pageParam = 'page',
  perPageParam = 'perPage'
}: {
  basePath: string;
  params: Record<string, string | string[] | undefined>;
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  pageParam?: string;
  perPageParam?: string;
}) {
  const pages = visiblePages(page, totalPages);
  const firstItem = total ? (page - 1) * perPage + 1 : 0;
  const lastItem = Math.min(total, page * perPage);

  return (
    <div className="admin-pagination">
      <div className="admin-pagination-summary">
        <strong>共 {total} 条</strong>
        <span>当前显示 {firstItem}-{lastItem}</span>
      </div>
      <nav aria-label="分页">
        <a aria-disabled={page <= 1} className={`button secondary small ${page <= 1 ? 'is-disabled' : ''}`} href={pageHref(basePath, params, {[pageParam]: 1, [perPageParam]: perPage}, pageParam, perPageParam)}>首页</a>
        <a aria-disabled={page <= 1} className={`button secondary small ${page <= 1 ? 'is-disabled' : ''}`} href={pageHref(basePath, params, {[pageParam]: Math.max(1, page - 1), [perPageParam]: perPage}, pageParam, perPageParam)}>上一页</a>
        <div className="admin-page-numbers">
          {pages.map((value, index) => {
            const previous = pages[index - 1];
            return (
              <span key={value}>
                {previous && value - previous > 1 ? <i aria-hidden="true">...</i> : null}
                <a
                  aria-current={value === page ? 'page' : undefined}
                  className={value === page ? 'active' : ''}
                  href={pageHref(basePath, params, {[pageParam]: value, [perPageParam]: perPage}, pageParam, perPageParam)}
                >
                  {value}
                </a>
              </span>
            );
          })}
        </div>
        <a aria-disabled={page >= totalPages} className={`button secondary small ${page >= totalPages ? 'is-disabled' : ''}`} href={pageHref(basePath, params, {[pageParam]: Math.min(totalPages, page + 1), [perPageParam]: perPage}, pageParam, perPageParam)}>下一页</a>
        <a aria-disabled={page >= totalPages} className={`button secondary small ${page >= totalPages ? 'is-disabled' : ''}`} href={pageHref(basePath, params, {[pageParam]: totalPages, [perPageParam]: perPage}, pageParam, perPageParam)}>末页</a>
      </nav>
      <form action={basePath} method="get">
        {Object.entries(params).map(([key, value]) => {
          if (key === pageParam || key === perPageParam) return null;
          if (Array.isArray(value)) return value.map((item) => item ? <input key={`${key}-${item}`} name={key} type="hidden" value={item} /> : null);
          return value ? <input key={key} name={key} type="hidden" value={value} /> : null;
        })}
        <input name={pageParam} type="hidden" value="1" />
        <label>
          <span>每页</span>
          <select name={perPageParam} defaultValue={perPage}>
            {ADMIN_PAGE_SIZES.map((size) => <option key={size} value={size}>{size} 条</option>)}
          </select>
        </label>
        <button type="submit">应用</button>
      </form>
    </div>
  );
}
