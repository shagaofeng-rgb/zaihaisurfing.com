import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import {formatAdminDate} from '@/lib/adminDataViews';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {listReviews} from '@/lib/adminExtraStore';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const params = await searchParams;
  const {page, perPage} = parseAdminPagination(params);
  const reviews = await listReviews();
  const paged = paginate(reviews, page, perPage);

  return (
    <AdminShell active="reviews">
      <div className="admin-title">
        <p className="eyebrow">评价管理</p>
        <h1>商品评价与审核</h1>
        <p>本页读取真实评价数据源。当前前台未开放公开评价时保持空表，不使用虚假评价填充。</p>
      </div>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>商品</th><th>客户</th><th>评分</th><th>内容</th><th>状态</th><th>来源</th><th>时间</th></tr></thead>
            <tbody>
              {paged.items.length ? paged.items.map((review) => (
                <tr key={review.id}>
                  <td>{review.productSlug}</td>
                  <td>{review.customerName}</td>
                  <td>{review.rating}</td>
                  <td>{review.content}</td>
                  <td>{review.status}</td>
                  <td>{review.source || '-'}</td>
                  <td>{formatAdminDate(review.createdAt)}</td>
                </tr>
              )) : <tr><td colSpan={7}>暂无真实商品评价数据。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination basePath="/admin/reviews" params={params} page={paged.page} perPage={paged.perPage} total={paged.total} totalPages={paged.totalPages} />
      </section>
    </AdminShell>
  );
}
