import fs from 'node:fs/promises';
import path from 'node:path';
import {newsArticles} from '@/lib/news';
import {products, productSlugs, type ProductSlug} from '@/lib/site';
import {readAnalyticsEvents, readStoreOrders, type AnalyticsEvent, type StoreOrder} from '@/lib/commerceStore';

const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'zaihai-commerce') : path.join(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'admin-store.json');

export type PublishStatus = 'draft' | 'published' | 'unpublished' | 'scheduled' | 'archived';
export type ContentType = 'blog' | 'news';

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  status: PublishStatus;
  parentId: string;
  updatedAt: string;
};

export type AdminProduct = {
  id: string;
  slug: ProductSlug | string;
  name: string;
  categorySlug: string;
  categoryName: string;
  coverImage: string;
  galleryImages: string[];
  shortDescription: string;
  fullDescription: string;
  keyFeatures: string[];
  specifications: {label: string; value: string}[];
  applicationScenarios: string[];
  priceCents: number;
  salePriceCents: number;
  currency: 'USD';
  sku: string;
  stock: number;
  moq: number;
  weightDimension: string;
  shippingInfo: string;
  seoTitle: string;
  seoDescription: string;
  status: PublishStatus;
  sortOrder: number;
  showOnHome: boolean;
  allowCart: boolean;
  allowDirectOrder: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MediaAsset = {
  id: string;
  fileName: string;
  url: string;
  alt: string;
  mimeType: string;
  sizeBytes: number;
  usage: string[];
  createdAt: string;
};

export type ContentPost = {
  id: string;
  type: ContentType;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  content: string;
  publishDate: string;
  author: string;
  source: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  status: PublishStatus | 'scheduled';
  createdAt: string;
  updatedAt: string;
};

export type SiteSettings = {
  companyName: string;
  adminNotificationEmail: string;
  contactEmail: string;
  whatsapp: string;
  address: string;
  paymentCurrency: string;
  qianhaiStatus: string;
  cookieConsentReady: boolean;
  updatedAt: string;
};

export type AdminStore = {
  categories: AdminCategory[];
  products: AdminProduct[];
  media: MediaAsset[];
  posts: ContentPost[];
  settings: SiteSettings;
};

export type CustomerLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  company: string;
  source: string;
  status: 'New Lead' | 'Contact Captured' | 'Order Created' | 'Payment Pending' | 'Paid' | 'Abandoned';
  interestedProducts: string[];
  cartItems: string[];
  lastActiveTime: string;
  trafficSource: string;
  notes: string;
};

function now() {
  return new Date().toISOString();
}

function cents(amount: number) {
  return Math.round(amount * 100);
}

async function readJson<T>(file: string) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

async function writeJson(file: string, value: unknown) {
  await fs.mkdir(path.dirname(file), {recursive: true});
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function readAdminStore() {
  const stored = await readJson<AdminStore>(STORE_FILE);
  if (stored) return stored;
  const seeded = createSeedStore();
  await writeJson(STORE_FILE, seeded);
  return seeded;
}

export async function writeAdminStore(updater: (store: AdminStore) => AdminStore) {
  const current = await readAdminStore();
  const next = updater(current);
  await writeJson(STORE_FILE, next);
  return next;
}

export async function listAdminProducts() {
  return (await readAdminStore()).products.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listAdminCategories() {
  return (await readAdminStore()).categories.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listAdminMedia() {
  return (await readAdminStore()).media.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAdminPosts(type?: ContentType) {
  const posts = (await readAdminStore()).posts;
  return posts.filter((post) => !type || post.type === type).sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

export async function getAdminDashboardData() {
  const [store, orders, events] = await Promise.all([readAdminStore(), readStoreOrders(), readAnalyticsEvents()]);
  const leads = buildCustomerLeads(orders, events);
  const paidOrders = orders.filter((order) => ['paid', 'processing', 'shipped', 'delivered'].includes(order.status));
  const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const productViews = events.filter((event) => event.type === 'product_view').length;
  const checkoutEvents = events.filter((event) => /checkout|order|payment/i.test(event.type)).length;
  return {
    store,
    metrics: {
      products: store.products.length,
      publishedProducts: store.products.filter((product) => product.status === 'published').length,
      posts: store.posts.length,
      orders: orders.length,
      paidOrders: paidOrders.length,
      leads: leads.length,
      revenue,
      visitors: new Set(events.map((event) => event.visitorId)).size,
      pageViews: events.filter((event) => event.type === 'page_view').length,
      productViews,
      checkoutEvents,
      conversionRate: events.length ? Math.round((orders.length / Math.max(1, new Set(events.map((event) => event.visitorId)).size)) * 1000) / 10 : 0
    },
    orders: orders.slice(-12).reverse(),
    events: events.slice(-24).reverse(),
    leads,
    funnel: buildFunnel(events, orders),
    popularProducts: countBy([...orders.map((order) => order.productName), ...events.map((event) => String(event.payload?.productSlug || '')).filter(Boolean)]),
    trafficSources: countBy(events.map((event) => event.referrer || '直接访问')),
    countries: countBy([...orders.map((order) => order.customer.country), ...events.map((event) => event.country)])
  };
}

export function buildCustomerLeads(orders: StoreOrder[], events: AnalyticsEvent[]): CustomerLead[] {
  const orderLeads = orders.map((order) => ({
    id: order.id,
    name: order.customer.name || `${order.checkout.firstName} ${order.checkout.lastName}`.trim() || '未知客户',
    email: order.customer.email || order.checkout.contact,
    phone: order.customer.phone,
    country: order.customer.country,
    company: order.customer.company,
    source: 'checkout',
    status: order.status === 'pending_payment' ? 'Payment Pending' as const : order.status === 'paid' ? 'Paid' as const : 'Order Created' as const,
    interestedProducts: [order.productName],
    cartItems: [`${order.productName} x ${order.quantity}`],
    lastActiveTime: order.updatedAt || order.createdAt,
    trafficSource: '网站结账',
    notes: order.customer.message || order.logisticsStatus
  }));
  const visitorIdsWithOrder = new Set(orders.map((order) => order.id));
  const checkoutEvents = events.filter((event) => /checkout|commerce_click|contact/i.test(event.type) && !visitorIdsWithOrder.has(event.sessionId));
  const eventLeads = checkoutEvents.slice(-30).reverse().map((event) => ({
    id: event.id,
    name: '匿名访客',
    email: '',
    phone: '',
    country: event.country,
    company: '',
    source: event.type,
    status: event.type.includes('checkout') ? 'Abandoned' as const : 'New Lead' as const,
    interestedProducts: [String(event.payload?.productSlug || event.page)].filter(Boolean),
    cartItems: [],
    lastActiveTime: event.timestamp,
    trafficSource: event.referrer || '直接访问',
    notes: `最后访问页面：${event.page}`
  }));
  return [...orderLeads, ...eventLeads].sort((a, b) => b.lastActiveTime.localeCompare(a.lastActiveTime));
}

function buildFunnel(events: AnalyticsEvent[], orders: StoreOrder[]) {
  const pageVisitors = new Set(events.map((event) => event.visitorId)).size;
  const productViewers = new Set(events.filter((event) => event.type === 'product_view').map((event) => event.visitorId)).size;
  const checkoutStarters = new Set(events.filter((event) => /checkout_start|begin_checkout|commerce_click/.test(event.type)).map((event) => event.visitorId)).size;
  const orderCount = orders.length;
  const paymentStarted = orders.filter((order) => order.gatewayStatus === 'pending' || order.gatewayStatus === 'success').length;
  const paid = orders.filter((order) => ['paid', 'processing', 'shipped', 'delivered'].includes(order.status)).length;
  return [
    {label: '访问网站', value: pageVisitors},
    {label: '浏览产品', value: productViewers},
    {label: '进入结账', value: checkoutStarters},
    {label: '创建订单', value: orderCount},
    {label: '发起支付', value: paymentStarted},
    {label: '完成支付', value: paid}
  ].map((row, index, rows) => ({
    ...row,
    conversion: index === 0 ? 100 : rows[index - 1].value ? Math.round((row.value / rows[index - 1].value) * 1000) / 10 : 0
  }));
}

function countBy(values: string[]) {
  const map = new Map<string, number>();
  values.filter(Boolean).forEach((value) => map.set(value, (map.get(value) || 0) + 1));
  return [...map.entries()].map(([label, value]) => ({label, value})).sort((a, b) => b.value - a.value).slice(0, 10);
}

function createSeedStore(): AdminStore {
  const createdAt = now();
  const categoryNames = [...new Set(productSlugs.map((slug) => products[slug].category))];
  const productGalleryImages: Record<ProductSlug, string[]> = {
    x1: ['/assets/catalog/x1/product.png', '/assets/catalog/x1/parts.png', '/assets/catalog/x1/detail.png', '/assets/catalog/x1/battery-detail.png', '/assets/catalog/x1/tail-detail.png'],
    'x1-pro': ['/assets/catalog/x1-pro/product.png', '/assets/catalog/x1-pro/parts.png', '/assets/catalog/x1-pro/parts-detail.png', '/assets/catalog/x1-pro/battery-detail.png', '/assets/catalog/x1-pro/tail-detail.png'],
    'rage-shark-x': ['/assets/catalog/rage-shark-x/main-boat.png', '/assets/catalog/rage-shark-x/front.png', '/assets/catalog/rage-shark-x/side.png', '/assets/catalog/rage-shark-x/parts.png'],
    p1: ['/assets/catalog/p1/hero.png', '/assets/catalog/p1/detail.png', '/assets/catalog/p1/bottom.png', '/assets/catalog/p1/tail.png'],
    'p1-pro': ['/assets/catalog/p1-pro/product.png', '/assets/catalog/p1-pro/detail.png', '/assets/catalog/p1-pro/bottom.png', '/assets/catalog/p1-pro/tail.png', '/assets/catalog/p1-pro/scene-01.png', '/assets/catalog/p1-pro/scene-02.png']
  };
  const categories = categoryNames.map((name, index) => ({
    id: `cat-${index + 1}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    description: `在海 ${name} 产品分类，用于 B2B 项目客户和零售客户筛选。`,
    coverImage: products[productSlugs[index] || 'x1'].image,
    seoTitle: `${name} Supplier | ZAIHAI SURFING`,
    seoDescription: `查看在海 ${name}，适用于度假村、租赁、水上乐园和经销商。`,
    sortOrder: index + 1,
    status: 'published' as const,
    parentId: '',
    updatedAt: createdAt
  }));
  const adminProducts = productSlugs.map((slug, index) => {
    const product = products[slug];
    const category = categories.find((item) => item.name === product.category);
    return {
      id: `prod-${slug}`,
      slug,
      name: product.name,
      categorySlug: category?.slug || '',
      categoryName: product.category,
      coverImage: product.image,
      galleryImages: productGalleryImages[slug],
      shortDescription: `${product.name}，适用于度假村、租赁、经销商和商业水上娱乐项目。`,
      fullDescription: `${product.name} 已接入在海后台，可管理参数、应用场景、价格、库存和 SEO 字段。`,
      keyFeatures: product.specs,
      specifications: product.specs.map((value, specIndex) => ({label: ['Power/System', 'Battery/Voltage', 'Speed', 'Endurance/Feature'][specIndex] || `Spec ${specIndex + 1}`, value})),
      applicationScenarios: ['Resorts', 'Rental businesses', 'Water parks', 'Yacht clubs', 'Distributors'],
      priceCents: cents(product.priceAmount),
      salePriceCents: 0,
      currency: 'USD' as const,
      sku: `ZH-${String(slug).toUpperCase()}`,
      stock: 20,
      moq: 1,
      weightDimension: '按型号和出口包装确认',
      shippingInfo: '报价后可确认海运、空运或客户货代自提。',
      seoTitle: `${product.name} | ZAIHAI SURFING`,
      seoDescription: `${product.name} for overseas resorts, rentals, yacht clubs, water parks and distributors.`,
      status: 'published' as const,
      sortOrder: index + 1,
      showOnHome: index < 3,
      allowCart: true,
      allowDirectOrder: true,
      createdAt,
      updatedAt: createdAt
    };
  });
  const media = adminProducts.flatMap((product) => product.galleryImages.map((url, index) => ({
    id: `media-${product.slug}-${index + 1}`,
    fileName: path.basename(url),
    url,
    alt: `${product.name} image ${index + 1}`,
    mimeType: 'image/png',
    sizeBytes: 0,
    usage: [product.name],
    createdAt
  })));
  const posts = newsArticles.map((article, index) => ({
    id: `post-${article.slug}`,
    type: index === 0 ? 'news' as const : 'blog' as const,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.hero,
    category: article.tags[0] || 'Water Sports',
    content: article.body.map((section) => `## ${section.heading}\n\n${section.paragraphs.join('\n\n')}`).join('\n\n'),
    publishDate: article.date,
    author: 'ZAIHAI Editorial Team',
    source: article.sources.map((source) => `${source.name}: ${source.url}`).join('\n'),
    tags: article.tags,
    seoTitle: `${article.title} | ZAIHAI SURFING`,
    seoDescription: article.excerpt,
    status: 'published' as const,
    createdAt,
    updatedAt: createdAt
  }));
  return {
    categories,
    products: adminProducts,
    media,
    posts,
    settings: {
      companyName: 'ZAIHAI SURFING',
      adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'davidsha@zaihaisurfing.com',
      contactEmail: 'davidsha@zaihaisurfing.com',
      whatsapp: '+86 17621485205',
      address: 'Room 110, 1st Floor, Building 1, Qushidai Future Building, Kecheng District, Quzhou, Zhejiang Province, China',
      paymentCurrency: 'USD',
      qianhaiStatus: process.env.QIANHAI_MERCHANT_ID ? '已配置' : '等待前海通道参数',
      cookieConsentReady: false,
      updatedAt: createdAt
    }
  };
}
