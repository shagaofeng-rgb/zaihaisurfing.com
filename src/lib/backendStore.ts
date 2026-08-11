import path from 'node:path';
import {revalidatePath} from 'next/cache';
import {newsArticles} from '@/lib/news';
import {products, productSlugs, type ProductSlug} from '@/lib/site';
import {readAnalyticsEvents, readStoreOrders, type AnalyticsEvent, type StoreOrder} from '@/lib/commerceStore';
import {readStoreObject, writeStoreObject} from '@/lib/durableStore';
import {markSitemapDirty} from '@/lib/sitemapState';
import {classifyTraffic, type AttributionSnapshot} from '@/lib/trafficAttribution';

const STORE_FILE = 'admin-store.json';

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
  coverImageSourceUrl?: string;
  coverImagePageUrl?: string;
  coverImageAlt?: string;
  coverImageFetchedAt?: string;
  coverImageStatus?: 'validated' | 'illustrative' | 'ai-illustrative' | 'failed' | 'pending';
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
  legacyEditorialMigrationCompletedAt?: string;
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

export type CustomerLeadDetail = {
  lead: CustomerLead;
  formFields: Array<{label: string; value: string}>;
  orders: StoreOrder[];
  timeline: AnalyticsEvent[];
  visitorIds: string[];
};

export type AdminDashboardFilter = {
  from?: Date;
  to?: Date;
};

function now() {
  return new Date().toISOString();
}

function cents(amount: number) {
  return Math.round(amount * 100);
}

export async function readAdminStore() {
  const stored = await readStoreObject<AdminStore>(STORE_FILE);
  if (stored) {
    const catalog = syncCatalogPrices(stored);
    const editorial = migrateLegacyEditorialPosts(catalog.store);
    if (catalog.changed || editorial.changed) {
      await writeStoreObject(STORE_FILE, editorial.store);
      return editorial.store;
    }
    return editorial.store;
  }
  const seeded = createSeedStore();
  await writeStoreObject(STORE_FILE, seeded);
  return seeded;
}

function migrateLegacyEditorialPosts(store: AdminStore) {
  // Legacy articles used to render directly from src/lib/news. Move them into
  // the persisted store once so public editorial routes have a single source.
  if (store.settings.legacyEditorialMigrationCompletedAt) {
    return {changed: false, store};
  }
  const existingSlugs = new Set(store.posts.map((post) => post.slug));
  const legacyPosts = createSeedStore().posts.filter((post) => !existingSlugs.has(post.slug));
  return {
    changed: true,
    store: {
      ...store,
      posts: legacyPosts.length ? [...store.posts, ...legacyPosts] : store.posts,
      settings: {
        ...store.settings,
        legacyEditorialMigrationCompletedAt: now(),
        updatedAt: now()
      }
    }
  };
}

function syncCatalogPrices(store: AdminStore) {
  let changed = false;
  const timestamp = now();
  const legacyPriceCents: Partial<Record<ProductSlug, number>> = {
    x1: cents(3200),
    'x1-pro': cents(3600),
    'rage-shark-x': cents(4000),
    p1: cents(5800),
    'p1-pro': cents(6499)
  };
  const updatedProducts = store.products.map((product) => {
    if (!productSlugs.includes(product.slug as ProductSlug)) return product;
    const slug = product.slug as ProductSlug;
    const siteProduct = products[slug];
    const nextPriceCents = cents(siteProduct.priceAmount);
    if (product.priceCents === nextPriceCents && product.salePriceCents === 0) return product;
    const legacyPrice = legacyPriceCents[slug];
    if (product.priceCents !== legacyPrice && product.salePriceCents !== legacyPrice) return product;
    changed = true;
    return {
      ...product,
      priceCents: nextPriceCents,
      salePriceCents: 0,
      updatedAt: timestamp
    };
  });
  return {changed, store: changed ? {...store, products: updatedProducts} : store};
}

export async function writeAdminStore(updater: (store: AdminStore) => AdminStore) {
  const current = await readAdminStore();
  const next = updater(current);
  await writeStoreObject(STORE_FILE, next);
  if (sitemapFingerprint(current) !== sitemapFingerprint(next)) {
    await markSitemapDirty('Published catalog or editorial content changed.').catch(() => undefined);
    revalidatePath('/', 'layout');
  }
  return next;
}

function sitemapFingerprint(store: AdminStore) {
  return JSON.stringify({
    categories: store.categories.map(({slug, status, updatedAt}) => ({slug, status, updatedAt})),
    products: store.products.map(({slug, status, updatedAt}) => ({slug, status, updatedAt})),
    posts: store.posts.map(({type, slug, status, publishDate, updatedAt}) => ({type, slug, status, publishDate, updatedAt}))
  });
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

function isInsideRange(timestamp: string, filter?: AdminDashboardFilter) {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) return false;
  if (filter?.from && time < filter.from.getTime()) return false;
  if (filter?.to && time > filter.to.getTime()) return false;
  return true;
}

export async function getAdminDashboardData(filter?: AdminDashboardFilter) {
  const [store, orders, events] = await Promise.all([readAdminStore(), readStoreOrders(), readAnalyticsEvents()]);
  const filteredOrders = orders.filter((order) => isInsideRange(order.createdAt, filter));
  const filteredEvents = events.filter((event) => isInsideRange(event.timestamp, filter));
  const leads = buildCustomerLeads(filteredOrders, filteredEvents);
  const paidOrders = filteredOrders.filter((order) => ['paid', 'processing', 'shipped', 'delivered'].includes(order.status));
  const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const productViews = filteredEvents.filter((event) => event.type === 'product_view').length;
  const checkoutEvents = filteredEvents.filter((event) => /checkout|order|payment/i.test(event.type)).length;
  return {
    store,
    metrics: {
      products: store.products.length,
      publishedProducts: store.products.filter((product) => product.status === 'published').length,
      posts: store.posts.length,
      orders: filteredOrders.length,
      paidOrders: paidOrders.length,
      leads: leads.length,
      revenue,
      visitors: new Set(filteredEvents.map((event) => event.visitorId)).size,
      pageViews: filteredEvents.filter((event) => event.type === 'page_view').length,
      productViews,
      checkoutEvents,
      conversionRate: filteredEvents.length ? Math.round((filteredOrders.length / Math.max(1, new Set(filteredEvents.map((event) => event.visitorId)).size)) * 1000) / 10 : 0
    },
    orders: filteredOrders.slice(-12).reverse(),
    events: filteredEvents.slice(-24).reverse(),
    leads,
    funnel: buildFunnel(filteredEvents, filteredOrders),
    popularProducts: countBy([...filteredOrders.map((order) => order.productName), ...filteredEvents.map((event) => String(event.payload?.productSlug || '')).filter(Boolean)]),
    trafficSources: countBy(filteredEvents.map((event) => trafficSourceLabel(event))),
    countries: countBy([...filteredOrders.map((order) => order.customer.country), ...filteredEvents.map((event) => event.country)])
  };
}

function trafficSourceLabel(event: AnalyticsEvent) {
  const attribution = event.attribution as AttributionSnapshot | null | undefined;
  const touch = attribution?.lastTouch || classifyTraffic({url: event.page, referrer: event.referrer});
  return `${touch.source || 'direct'} / ${touch.channel || 'direct'}`;
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
  const eventLeads = checkoutEvents.slice(-30).reverse().map((event) => {
    const payload = event.payload || {};
    const isInquiry = event.type === 'contact_inquiry';
    const product = String(payload.product || payload.productSlug || event.page || '').trim();
    const message = String(payload.message || '').trim();
    return {
      id: event.id,
      name: String(payload.name || (isInquiry ? 'Contact Inquiry' : '匿名访客')),
      email: String(payload.email || ''),
      phone: String(payload.phone || ''),
      country: String(payload.country || event.country || ''),
      company: String(payload.company || ''),
      source: event.type,
      status: event.type.includes('checkout') ? 'Abandoned' as const : isInquiry ? 'Contact Captured' as const : 'New Lead' as const,
      interestedProducts: [product].filter(Boolean),
      cartItems: [],
      lastActiveTime: event.timestamp,
      trafficSource: event.referrer || '直接访问',
      notes: message || `最后访问页面：${event.page}`
    };
  });
  return [...orderLeads, ...eventLeads].sort((a, b) => b.lastActiveTime.localeCompare(a.lastActiveTime));
}

function eventVisitorIds(event: AnalyticsEvent) {
  const attribution = event.attribution as AttributionSnapshot | null | undefined;
  return [attribution?.visitorId, event.visitorId, event.sessionId].map((value) => String(value || '').trim()).filter(Boolean);
}

function orderVisitorIds(order: StoreOrder) {
  const attribution = order.attribution as AttributionSnapshot | null | undefined;
  return [attribution?.visitorId, order.userId].map((value) => String(value || '').trim()).filter(Boolean);
}

function readableFieldLabel(key: string) {
  const labels: Record<string, string> = {
    name: 'Name', email: 'Email', phone: 'Phone', country: 'Country / region', company: 'Company',
    product: 'Interested product', productSlug: 'Interested product', quantity: 'Quantity', message: 'Message',
    buyerType: 'Buyer type', waterArea: 'Water area', destinationPort: 'Preferred port', targetMarket: 'Target market',
    oem: 'OEM / private label request', port: 'Preferred port', language: 'Language',
    page: 'Submitted from page', source: 'Source', medium: 'Medium', campaign: 'Campaign'
  };
  return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase());
}

function displayFieldValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) return value.map((item) => displayFieldValue(item)).filter(Boolean).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export async function getCustomerLeadDetail(leadId: string): Promise<CustomerLeadDetail | null> {
  const [orders, events] = await Promise.all([readStoreOrders(), readAnalyticsEvents()]);
  const lead = buildCustomerLeads(orders, events).find((item) => item.id === leadId);
  if (!lead) return null;

  const selectedEvent = events.find((event) => event.id === leadId);
  const selectedOrder = orders.find((order) => order.id === leadId);
  const visitorIds = new Set<string>();
  if (selectedEvent) eventVisitorIds(selectedEvent).forEach((id) => visitorIds.add(id));
  if (selectedOrder) orderVisitorIds(selectedOrder).forEach((id) => visitorIds.add(id));

  const matchingOrders = orders.filter((order) => {
    if (order.id === leadId) return true;
    if (lead.email && order.customer.email && order.customer.email.toLowerCase() === lead.email.toLowerCase()) return true;
    return orderVisitorIds(order).some((id) => visitorIds.has(id));
  });
  matchingOrders.flatMap(orderVisitorIds).forEach((id) => visitorIds.add(id));

  const timeline = events
    .filter((event) => {
      if (event.id === leadId) return true;
      if (eventVisitorIds(event).some((id) => visitorIds.has(id))) return true;
      const eventEmail = String(event.payload?.email || '').trim().toLowerCase();
      return Boolean(lead.email && eventEmail && eventEmail === lead.email.toLowerCase());
    })
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const formPayload = selectedEvent?.payload || {};
  const formFields = Object.entries(formPayload)
    .filter(([key, value]) => !['cardNumber', 'cardCvv', 'cvv', 'password'].includes(key.toLowerCase()) && displayFieldValue(value))
    .map(([key, value]) => ({label: readableFieldLabel(key), value: displayFieldValue(value)}));

  return {lead, formFields, orders: matchingOrders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), timeline, visitorIds: [...visitorIds]};
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
    x1: ['/assets/catalog/x1/hero-angle.png', '/assets/catalog/x1/side-view.png', '/assets/catalog/x1/rear-view.png', '/assets/catalog/x1/tail-closeup.png', '/assets/catalog/x1/top-view.png'],
    'x1-pro': ['/assets/catalog/x1-pro/hero-angle.png', '/assets/catalog/x1-pro/side-view.png', '/assets/catalog/x1-pro/rear-view.png', '/assets/catalog/x1-pro/detail-closeup.png', '/assets/catalog/x1-pro/top-view.png'],
    'rage-shark-x': ['/assets/catalog/rage-shark-x/hero-angle.png', '/assets/catalog/rage-shark-x/side-view.png', '/assets/catalog/rage-shark-x/top-view.png', '/assets/catalog/rage-shark-x/head-closeup.png', '/assets/catalog/rage-shark-x/front-view.png'],
    p1: ['/assets/catalog/p1/hero-angle.png', '/assets/catalog/p1/side-view.png', '/assets/catalog/p1/bottom-view.png', '/assets/catalog/p1/rear-view.png', '/assets/catalog/p1/tail-closeup.png', '/assets/catalog/p1/detail-view.png'],
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
      showOnHome: true,
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
      legacyEditorialMigrationCompletedAt: createdAt,
      updatedAt: createdAt
    }
  };
}
