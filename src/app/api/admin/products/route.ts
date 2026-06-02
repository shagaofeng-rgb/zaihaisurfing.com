import {requireAdminApiSession} from '@/lib/adminAuth';
import {listAdminProducts, writeAdminStore, type AdminProduct} from '@/lib/backendStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function text(formData: FormData, key: string, limit = 240) {
  return String(formData.get(key) || '').trim().slice(0, limit);
}

export async function GET() {
  const {response} = await requireAdminApiSession();
  if (response) return response;
  return Response.json({products: await listAdminProducts()});
}

export async function POST(request: Request) {
  const {response} = await requireAdminApiSession();
  if (response) return response;
  const formData = await request.formData();
  const now = new Date().toISOString();
  const categorySlug = text(formData, 'categorySlug', 120);
  await writeAdminStore((store) => {
    const category = store.categories.find((item) => item.slug === categorySlug);
    const product: AdminProduct = {
      id: `prod-${Date.now()}`,
      slug: text(formData, 'slug', 120),
      name: text(formData, 'name', 180),
      categorySlug,
      categoryName: category?.name || categorySlug,
      coverImage: text(formData, 'coverImage', 260) || '/assets/catalog/x1/main.png',
      galleryImages: [],
      shortDescription: '',
      fullDescription: '',
      keyFeatures: [],
      specifications: [],
      applicationScenarios: [],
      priceCents: Math.max(0, Number(text(formData, 'price', 24) || 0)) * 100,
      salePriceCents: 0,
      currency: 'USD',
      sku: `ZH-${text(formData, 'slug', 80).toUpperCase()}`,
      stock: 0,
      moq: 1,
      weightDimension: '',
      shippingInfo: '',
      seoTitle: `${text(formData, 'name', 180)} | ZAIHAI SURFING`,
      seoDescription: '',
      status: 'draft',
      sortOrder: store.products.length + 1,
      showOnHome: false,
      allowCart: true,
      allowDirectOrder: true,
      createdAt: now,
      updatedAt: now
    };
    return {...store, products: [...store.products, product]};
  });
  return Response.redirect(new URL('/admin/products', request.url), 303);
}
