export const ADMIN_PAGE_SIZES = [10, 20, 50] as const;

export function parseAdminPagination(
  params: Record<string, string | string[] | undefined>,
  pageParam = 'page',
  perPageParam = 'perPage'
) {
  const rawPageValue = params[pageParam];
  const rawPerPageValue = params[perPageParam];
  const rawPage = Number(Array.isArray(rawPageValue) ? rawPageValue[0] : rawPageValue || 1);
  const rawPerPage = Number(Array.isArray(rawPerPageValue) ? rawPerPageValue[0] : rawPerPageValue || 10);
  const perPage = ADMIN_PAGE_SIZES.includes(rawPerPage as (typeof ADMIN_PAGE_SIZES)[number]) ? rawPerPage : 10;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  return {page, perPage};
}

export function paginate<T>(items: T[], page: number, perPage: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * perPage;
  return {
    total,
    totalPages,
    page: currentPage,
    perPage,
    items: items.slice(start, start + perPage)
  };
}

export function pageHref(
  basePath: string,
  params: Record<string, string | string[] | undefined>,
  next: Record<string, string | number>,
  pageParam = 'page',
  perPageParam = 'perPage'
) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (key === pageParam || key === perPageParam) return;
    if (Array.isArray(value)) value.forEach((item) => item && search.append(key, item));
    else if (value) search.set(key, value);
  });
  Object.entries(next).forEach(([key, value]) => search.set(key, String(value)));
  return `${basePath}?${search.toString()}`;
}
