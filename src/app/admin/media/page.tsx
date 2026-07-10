import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {listAdminMedia} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminMediaPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const {page, perPage} = parseAdminPagination(params);
  const media = await listAdminMedia();
  const paged = paginate(media, page, perPage);
  return (
    <AdminShell active="媒体库">
      <div className="admin-title">
        <p className="eyebrow">图片与素材</p>
        <h1>媒体库</h1>
        <p>上传图片到 Vercel Blob，或登记已有图片 URL，并统一管理 ALT 文案和素材使用位置。</p>
      </div>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">登记素材</p>
          <h2>添加已有图片</h2>
        </div>
        <form className="admin-form-grid" action="/api/admin/media" method="post" encType="multipart/form-data">
          <label><span>上传图片</span><input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" /></label>
          <label><span>或填写已有 URL</span><input name="url" placeholder="/assets/catalog/x1/product.png" /></label>
          <input name="alt" placeholder="图片 ALT 描述" required />
          <input name="usage" placeholder="使用位置，例如产品/新闻" />
          <button type="submit">加入媒体库</button>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-media-grid">
          {paged.items.length ? paged.items.map((asset) => (
            <article key={asset.id}>
              <img src={asset.url} alt={asset.alt} />
              <strong>{asset.alt}</strong>
              <small>{asset.url}</small>
              <span>{asset.usage.join(', ') || '未绑定使用位置'}</span>
            </article>
          )) : <article><strong>暂无媒体数据</strong><small>请先添加已有图片路径或接入上传接口。</small></article>}
        </div>
        <AdminPagination basePath="/admin/media" params={params} page={paged.page} perPage={paged.perPage} total={paged.total} totalPages={paged.totalPages} />
      </section>
    </AdminShell>
  );
}
