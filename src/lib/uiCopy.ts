import type {Locale} from '@/i18n/routing';
import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';
import ruMessages from '../../messages/ru.json';
import arMessages from '../../messages/ar.json';
import frMessages from '../../messages/fr.json';
import deMessages from '../../messages/de.json';
import ptMessages from '../../messages/pt.json';

type ScenarioCopy = {
  title: string;
  label: string;
  text: string;
  products: string;
  href: string;
  cta: string;
};

type UiCopy = {
  nav: {
    home: string;
    products: string;
    applications: string;
    support: string;
    news: string;
    blog: string;
    about: string;
    contact: string;
    quote: string;
    fleet: string;
    oemDistributor: string;
  };
  mega: {
    featured: string;
    featuredText: string;
    featuredLink: string;
    electricSurfboards: string;
    electricWaterKarts: string;
    fuelSurfboards: string;
    accessories: string;
    allProducts: string;
    supportTitle: string;
    oem: string;
    shipping: string;
    rental: string;
    distributor: string;
    faq: string;
    aboutTitle: string;
    aboutZaihai: string;
    quality: string;
    markets: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    intro: string;
    shop: string;
    quote: string;
    watch: string;
    tags: string[];
    cards: Array<{label: string; title: string; text: string; href: string}>;
  };
  homeSections: {
    collectionEyebrow: string;
    collectionTitle: string;
    collectionText: string;
    videoEyebrow: string;
    videoTitle: string;
    videoText: string;
    explore: string;
    manifestEyebrow: string;
    manifestText: string;
    trust: Array<{title: string; text: string}>;
  };
  footer: {
    brandText: string;
    quote: string;
    products: string;
    buyerSupport: string;
    contact: string;
    accessories: string;
    catalog: string;
    applications: string;
    oem: string;
    shipping: string;
    distributor: string;
    faq: string;
    maps: string;
    copyright: string;
  };
  products: {
    tabs: string[];
    price: string;
    specs: string;
    bestFor: string;
    viewDetails: string;
    requestQuote: string;
    quickView: string;
    compareTitle: string;
    compareText: string;
  };
  productDetail: {
    priceBadge: string;
    buyerRecommended: string;
    qty: string;
    buyNow: string;
    requestQuote: string;
    whatsapp: string;
    download: string;
    secure: string;
    overview: string;
    receive: string;
    support: string;
    beforeShipment: string;
    faqTitle: string;
    faq: string[];
  };
  applicationsPage: {
    eyebrow: string;
    h1: string;
    intro: string;
    buyerFit: string;
    matrixTitle: string;
    matrixText: string;
    scenarios: ScenarioCopy[];
    ctaEyebrow: string;
    ctaTitle: string;
    ctaText: string;
    ctaButton: string;
  };
  factoryPage: {
    eyebrow: string;
    h1: string;
    intro: string;
    supportTitle: string;
    workflowTitle: string;
    oemTitle: string;
    docsTitle: string;
    ctaTitle: string;
    ctaText: string;
    ctaButton: string;
    support: Array<{title: string; text: string}>;
    workflow: string[];
    oem: string[];
    docs: string[];
  };
  contactPage: {
    company: string;
    region: string;
    addressLabel: string;
    emailLabel: string;
    whatsappLabel: string;
    formTitle: string;
    formText: string;
    fields: {
      name: string;
      email: string;
      phone: string;
      company: string;
      country: string;
      buyerType: string;
      product: string;
      quantity: string;
      market: string;
      message: string;
      submit: string;
    };
    buyerTypes: string[];
    productOptions: string[];
  };
  mobileCta: {
    whatsapp: string;
    quote: string;
  };
};

type Messages = typeof enMessages;

const address = 'Room 110, 1st Floor, Building 2, Qushidai Future Building, Kecheng District, Quzhou, Zhejiang Province, China';

const en: UiCopy = {
  nav: {
    home: 'Home',
    products: 'Products',
    applications: 'Applications',
    support: 'Support',
    news: 'News',
    blog: 'Blog',
    about: 'About',
    contact: 'Contact',
    quote: 'Get Quote',
    fleet: 'Fleet Packages',
    oemDistributor: 'OEM & Distributor'
  },
  mega: {
    featured: 'Featured model',
    featuredText: '12 kW electric surfboard for premium riding, resort demos and high-impact videos.',
    featuredLink: 'View X1 Pro details',
    electricSurfboards: 'Electric Surfboards',
    electricWaterKarts: 'Electric Go-Kart Boats',
    fuelSurfboards: 'Fuel-Powered Surfboards',
    accessories: 'Accessories & Spare Parts',
    allProducts: 'All Products',
    supportTitle: 'Buyer Support',
    oem: 'OEM/ODM Support',
    shipping: 'Shipping & Battery Documents',
    rental: 'Rental Fleet Support',
    distributor: 'Distributor Cooperation',
    faq: 'FAQ',
    aboutTitle: 'About',
    aboutZaihai: 'About ZAIHAI',
    quality: 'Quality & Export Support',
    markets: 'Global Markets'
  },
  hero: {
    eyebrow: 'Premium ocean sports equipment',
    title: 'Premium Electric Surfboards & Go-Kart Boats for Resorts, Rentals and Distributors',
    intro: 'ZAIHAI helps water sports businesses, resorts, rental operators, yacht clubs and distributors build high-attraction water entertainment projects with electric surfboards, fuel-powered surfboards, electric go-kart boats and export-ready support.',
    shop: 'Explore Products',
    quote: 'Get Distributor Quote',
    watch: 'Watch Riding Video',
    tags: ['Electric Surfboards', 'Go-Kart Boats', 'OEM / Distributor Support'],
    cards: [
      {label: 'Electric Surfboards', title: 'X1 Pro / X1 Series', text: 'High-speed attraction for resorts, yacht clubs and premium demos.', href: '/products/x1-pro'},
      {label: 'Go-Kart Boats', title: 'Rage Shark X', text: 'Easy-drive guest experience for water parks and scenic rentals.', href: '/products/rage-shark-x'},
      {label: 'Fuel Surfboards', title: 'P1 / P1 Pro Series', text: 'Longer ride time for outdoor adventure operators and distributors.', href: '/products/p1-pro'}
    ]
  },
  homeSections: {
    collectionEyebrow: 'Collection list',
    collectionTitle: 'Choose Your Water Sports Product Line',
    collectionText: 'Select the right ZAIHAI product line by water area, rider type, operating model, project budget and local market demand.',
    videoEyebrow: 'Real riding footage',
    videoTitle: 'See ZAIHAI Surfboards on the Water',
    videoText: 'Watch the actual riding scene and understand how the product looks in open-water entertainment, resort demos and rental experiences.',
    explore: 'Explore Products',
    manifestEyebrow: 'Premium ocean lifestyle, commercial project value',
    manifestText: 'Speed, splash, strong visual attraction and export-ready support help overseas buyers turn water areas into memorable guest experiences and distributor-ready product lines.',
    trust: [
      {title: 'OEM/ODM Customization', text: 'Custom colors, logo branding, packaging and project-based product bundles.'},
      {title: 'Export Documentation', text: 'Battery notes, packing list, shipping size and document support for export planning.'},
      {title: 'Battery Shipping Support', text: 'Guidance for lithium battery shipment preparation and forwarder communication.'},
      {title: 'Distributor Cooperation', text: 'Model selection, product media and catalog support for local market development.'}
    ]
  },
  footer: {
    brandText: 'Premium water sports equipment for resorts, rentals, distributors and private buyers.',
    quote: 'Send Your Requirements',
    products: 'Products',
    buyerSupport: 'Buyer Support',
    contact: 'Contact',
    accessories: 'Accessories',
    catalog: 'Full Catalog',
    applications: 'Applications',
    oem: 'OEM/ODM Support',
    shipping: 'Shipping Documents',
    distributor: 'Distributor Cooperation',
    faq: 'FAQ',
    maps: 'Google Maps',
    copyright: '2026 ZAIHAI SURFING. Premium water sports equipment supplier.'
  },
  products: {
    tabs: ['All', 'Electric Surfboards', 'Electric Go-Kart Boats', 'Fuel-Powered Surfboards', 'For Resorts', 'For Rentals', 'For Distributors'],
    price: 'Commercial supply',
    specs: 'Core specs',
    bestFor: 'Best for',
    viewDetails: 'View Details',
    requestQuote: 'Request Quote',
    quickView: 'Ask for Package',
    compareTitle: 'Compare Models',
    compareText: 'Compare ZAIHAI X1, X1 Pro, Rage Shark X, P1 and P1 Pro by power, speed, endurance, buyer type and best use case.'
  },
  productDetail: {
    priceBadge: 'Distributor pricing available',
    buyerRecommended: 'Commercial buyer recommended',
    qty: 'Target quantity',
    buyNow: 'Get Distributor Price',
    requestQuote: 'Request Quote',
    whatsapp: 'WhatsApp Now',
    download: 'Ask for Shipping Cost',
    secure: 'Final quotation, shipping cost and project package are confirmed by the sales team according to destination, quantity, packaging and buyer type.',
    overview: 'Product Overview',
    receive: 'What overseas buyers receive',
    support: 'Commercial purchasing support',
    beforeShipment: 'Before shipment',
    faqTitle: 'Product FAQ',
    faq: ['How long does the battery last?', 'Can I order one sample first?', 'Can the logo and color be customized?', 'What documents are needed for battery shipping?', 'Is this suitable for rental business?', 'Do you provide spare parts?', 'What is the MOQ for distributors?']
  },
  applicationsPage: {
    eyebrow: 'Applications',
    h1: 'Choose Water Sports Equipment by Business Scenario',
    intro: 'ZAIHAI helps resorts, rentals, water parks, yacht clubs, distributors and private buyers choose products for real operating scenarios.',
    buyerFit: 'Buyer Fit',
    matrixTitle: 'Choose Products by Buyer Type',
    matrixText: 'Different buyers care about different outcomes: guest attraction, rental return, family safety, premium leisure or distributor margin. This section helps overseas buyers quickly understand where each ZAIHAI product line fits.',
    scenarios: [
      {title: 'Resorts & Hotels', label: 'Guest experience upgrade', text: 'Create a premium water attraction for beach resorts, island hotels and lake properties.', products: 'Recommended: X1 Pro / X1 / Rage Shark X', href: '/products/x1-pro', cta: 'View Resort Solution'},
      {title: 'Rental Businesses', label: 'Fleet revenue and durability', text: 'Match products by rider level, session length, maintenance workflow and local water conditions.', products: 'Recommended: X1, Rage Shark X and spare parts package', href: '/products', cta: 'View Rental Solution'},
      {title: 'Water Parks', label: 'Family-friendly attraction', text: 'Use easy-drive electric go-kart boats for controlled water areas, ticketed entertainment and family guests.', products: 'Recommended: Rage Shark X electric go-kart boat', href: '/products/rage-shark-x', cta: 'View Water Park Solution'},
      {title: 'Yacht Clubs', label: 'Premium leisure add-on', text: 'Add compact electric surfboards as a member benefit, demo product or private buyer attraction.', products: 'Recommended: X1 Pro electric surfboard', href: '/products/x1-pro', cta: 'View Yacht Club Solution'},
      {title: 'Distributors', label: 'Market-ready product line', text: 'Build a local catalog with clear positioning, packaging, model comparison and after-sales support.', products: 'Recommended: full catalog and distributor inquiry', href: '/contact', cta: 'View Distributor Solution'},
      {title: 'Private Buyers', label: 'Premium personal riding', text: 'Choose a model for private leisure, lake houses, yacht-side riding and personal adventure use.', products: 'Recommended: X1 Pro / P1 Pro', href: '/products', cta: 'View Buyer Options'}
    ],
    ctaEyebrow: 'Project Matching',
    ctaTitle: 'Not sure which model fits your local market?',
    ctaText: 'Send your target country, buyer type, water area and expected quantity. We will suggest a product combination for your resort, rental fleet or distribution plan.',
    ctaButton: 'Send Your Requirements'
  },
  factoryPage: {
    eyebrow: 'Quality & Export Support',
    h1: 'Quality, Customization and Export Support for Global Buyers',
    intro: 'We coordinate production, inspection, packaging and export support according to project requirements.',
    supportTitle: 'What We Support',
    workflowTitle: 'Quality Check Workflow',
    oemTitle: 'OEM/ODM Options',
    docsTitle: 'Export Documents',
    ctaTitle: 'Send your project requirements',
    ctaText: 'Share your model, quantity, target market, branding needs and shipping plan. We will prepare suitable support options.',
    ctaButton: 'Request Export Support',
    support: [
      {title: 'OEM/ODM customization', text: 'Logo, color, package and product bundle discussions for project and distributor buyers.'},
      {title: 'Product inspection', text: 'Appearance, accessory set, charger, battery mounting and key configuration checks before packing.'},
      {title: 'Battery document support', text: 'Battery notes, MSDS if available, packing list and forwarder communication support.'},
      {title: 'Export logistics coordination', text: 'Shipping size, crate photos, loading notes and document preparation for overseas buyers.'}
    ],
    workflow: ['Product configuration confirmation', 'Appearance and accessory check', 'Battery and charger check', 'Waterproof area review', 'Packing photo confirmation', 'Export document preparation'],
    oem: ['Logo', 'Color', 'Packaging', 'Product bundle', 'Distributor catalog support'],
    docs: ['Packing list', 'Commercial invoice', 'Battery notes', 'MSDS if available', 'Shipping size', 'Wooden crate packing photos']
  },
  contactPage: {
    company: 'Quzhou Qiying Import & Export Co., Ltd.',
    region: 'Quzhou, Zhejiang, China',
    addressLabel: 'Address',
    emailLabel: 'Email',
    whatsappLabel: 'WhatsApp',
    formTitle: 'Send your product requirements',
    formText: 'Tell us your buyer type, target market, expected quantity and preferred product line. We will reply with model suggestions and quotation details.',
    fields: {
      name: 'Name *',
      email: 'Email *',
      phone: 'WhatsApp / Phone *',
      company: 'Company',
      country: 'Country / Region *',
      buyerType: 'Buyer Type *',
      product: 'Interested Product *',
      quantity: 'Expected Quantity',
      market: 'Target Market',
      message: 'Message *',
      submit: 'Send Inquiry'
    },
    buyerTypes: ['Resort / Hotel', 'Rental Operator', 'Water Park', 'Yacht Club', 'Distributor', 'Private Buyer', 'Other'],
    productOptions: ['X1 Electric Surfboard', 'X1 Pro Electric Surfboard', 'Rage Shark X Electric Go-Kart Boat', 'P1 Fuel-Powered Surfboard', 'P1 Pro Fuel-Powered Surfboard', 'Multiple Products', 'Not Sure Yet']
  },
  mobileCta: {
    whatsapp: 'WhatsApp',
    quote: 'Get Quote'
  }
};

const messageByLocale: Record<Locale, Messages> = {
  en: enMessages,
  es: esMessages,
  de: deMessages,
  ru: ruMessages,
  ar: arMessages,
  fr: frMessages,
  pt: ptMessages
};

const homeLabels: Record<Locale, string> = {
  en: 'Home',
  es: 'Inicio',
  de: 'Startseite',
  ru: '\u0413\u043b\u0430\u0432\u043d\u0430\u044f',
  ar: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629',
  fr: 'Accueil',
  pt: 'In\u00edcio'
};

function localizedCopy(locale: Locale): UiCopy {
  if (locale === 'en') return en;

  const m = messageByLocale[locale];
  const scenarioText = `${m.applications.intro} ${m.home.applicationsText}`;
  const ctaText = `${m.contact.intro} ${m.home.oemText}`;
  const productLineText = `${m.products.categoryTitle}: X1, X1 Pro, Rage Shark X, P1, P1 Pro.`;

  return {
    ...en,
    nav: {
      home: homeLabels[locale],
      products: m.nav.products,
      applications: m.nav.applications,
      support: m.nav.factory,
      news: 'News',
      blog: m.nav.blog,
      about: m.nav.about,
      contact: m.nav.contact,
      quote: m.nav.quote,
      fleet: en.nav.fleet,
      oemDistributor: en.nav.oemDistributor
    },
    mega: {
      ...en.mega,
      featured: m.common.eyebrow,
      featuredLink: m.common.viewDetails,
      electricSurfboards: m.productNames.x1,
      electricWaterKarts: m.productNames['rage-shark-x'],
      fuelSurfboards: m.productNames.p1,
      accessories: m.products.shipping,
      allProducts: m.products.allModels,
      supportTitle: m.nav.factory,
      shipping: m.products.shipping,
      distributor: m.applications.distributors,
      aboutTitle: m.nav.about,
      aboutZaihai: m.nav.about,
      quality: m.factory.h1,
      markets: m.home.marketsTitle
    },
    hero: {
      ...en.hero,
      eyebrow: m.common.eyebrow,
      title: m.home.h1,
      intro: m.home.intro,
      shop: m.home.secondaryCta,
      quote: m.home.primaryCta,
      watch: m.common.viewDetails,
      tags: [m.products.categoryTitle, m.applications.h1, m.factory.h1],
      cards: [
        {label: m.products.categoryTitle, title: m.productNames['x1-pro'], text: m.products.intro, href: '/products/x1-pro'},
        {label: m.applications.parks, title: m.productNames['rage-shark-x'], text: m.applications.intro, href: '/products/rage-shark-x'},
        {label: m.products.shipping, title: m.productNames['p1-pro'], text: m.factory.items, href: '/products/p1-pro'}
      ]
    },
    homeSections: {
      collectionEyebrow: m.products.categoryTitle,
      collectionTitle: m.home.productsTitle,
      collectionText: m.home.productsText,
      videoEyebrow: m.common.eyebrow,
      videoTitle: m.home.applicationsTitle,
      videoText: m.home.applicationsText,
      explore: m.common.viewDetails,
      manifestEyebrow: m.home.oemTitle,
      manifestText: m.home.oemText,
      trust: [
        {title: m.factory.h1, text: m.factory.intro},
        {title: m.products.shipping, text: m.factory.items},
        {title: m.applications.distributors, text: m.home.oemText},
        {title: m.home.marketsTitle, text: m.home.marketsText}
      ]
    },
    footer: {
      ...en.footer,
      brandText: m.common.footer,
      quote: m.common.sendInquiry,
      products: m.nav.products,
      buyerSupport: m.nav.factory,
      contact: m.nav.contact,
      accessories: m.products.shipping,
      catalog: m.products.allModels,
      applications: m.nav.applications,
      shipping: m.products.shipping,
      distributor: m.applications.distributors,
      maps: m.contact.viewMap
    },
    products: {
      tabs: [m.products.allModels, m.productNames.x1, m.productNames['rage-shark-x'], m.productNames.p1, m.applications.resorts, m.applications.rentals, m.applications.distributors],
      price: 'USD',
      specs: m.products.specs,
      bestFor: m.products.bestFor,
      viewDetails: m.common.viewDetails,
      requestQuote: m.common.requestQuote,
      quickView: m.common.viewDetails,
      compareTitle: m.products.allModels,
      compareText: `${m.products.intro} ${m.products.shipping}`
    },
    productDetail: {
      ...en.productDetail,
      priceBadge: m.common.requestQuote,
      buyerRecommended: m.products.bestFor,
      buyNow: m.home.primaryCta,
      requestQuote: m.common.requestQuote,
      whatsapp: m.common.whatsapp,
      download: m.products.specs,
      secure: m.products.shipping,
      overview: m.products.specs,
      receive: m.factory.items,
      support: m.factory.h1,
      beforeShipment: m.products.shipping,
      faqTitle: m.products.shipping,
      faq: [m.products.specs, m.products.bestFor, m.products.shipping, m.common.requestQuote, m.common.sendInquiry]
    },
    applicationsPage: {
      eyebrow: m.nav.applications,
      h1: m.applications.h1,
      intro: m.applications.intro,
      buyerFit: m.products.bestFor,
      matrixTitle: m.home.applicationsTitle,
      matrixText: `${m.home.applicationsText} ${m.home.marketsText}`,
      scenarios: [
        {title: m.applications.resorts, label: m.home.marketsTitle, text: scenarioText, products: productLineText, href: '/products/x1-pro', cta: m.common.viewDetails},
        {title: m.applications.rentals, label: m.products.bestFor, text: scenarioText, products: productLineText, href: '/products', cta: m.common.viewDetails},
        {title: m.applications.parks, label: m.home.applicationsTitle, text: scenarioText, products: productLineText, href: '/products/rage-shark-x', cta: m.common.viewDetails},
        {title: m.applications.yachts, label: m.home.marketsTitle, text: scenarioText, products: productLineText, href: '/products/x1-pro', cta: m.common.viewDetails},
        {title: m.applications.distributors, label: m.home.oemTitle, text: scenarioText, products: productLineText, href: '/contact', cta: m.common.sendInquiry},
        {title: m.products.allModels, label: m.products.bestFor, text: scenarioText, products: productLineText, href: '/products', cta: m.common.viewDetails}
      ],
      ctaEyebrow: m.common.requestQuote,
      ctaTitle: m.contact.h1,
      ctaText,
      ctaButton: m.common.sendInquiry
    },
    factoryPage: {
      ...en.factoryPage,
      eyebrow: m.nav.factory,
      h1: m.factory.h1,
      intro: m.factory.intro,
      supportTitle: m.factory.items,
      workflowTitle: m.products.shipping,
      oemTitle: m.home.oemTitle,
      docsTitle: m.products.shipping,
      ctaTitle: m.contact.h1,
      ctaText: m.contact.intro,
      ctaButton: m.common.sendInquiry,
      support: [
        {title: m.home.oemTitle, text: m.home.oemText},
        {title: m.factory.h1, text: m.factory.intro},
        {title: m.products.shipping, text: m.factory.items},
        {title: m.applications.distributors, text: m.home.marketsText}
      ],
      workflow: [m.products.specs, m.products.shipping, m.factory.items, m.common.sendInquiry],
      oem: [m.home.oemTitle, m.factory.items, m.applications.distributors],
      docs: [m.products.shipping, m.factory.items, address]
    },
    contactPage: {
      ...en.contactPage,
      region: m.common.address,
      addressLabel: m.contact.mapTitle,
      emailLabel: 'Email',
      whatsappLabel: 'WhatsApp',
      formTitle: m.contact.h1,
      formText: m.contact.intro,
      fields: {
        ...en.contactPage.fields,
        name: 'Name *',
        email: 'Email *',
        phone: 'WhatsApp / Phone *',
        country: 'Country / Region *',
        buyerType: m.products.bestFor,
        product: m.products.categoryTitle,
        submit: m.common.sendInquiry
      },
      buyerTypes: [m.applications.resorts, m.applications.rentals, m.applications.parks, m.applications.yachts, m.applications.distributors],
      productOptions: [m.productNames.x1, m.productNames['x1-pro'], m.productNames['rage-shark-x'], m.productNames.p1, m.productNames['p1-pro'], m.products.allModels]
    },
    mobileCta: {
      whatsapp: 'WhatsApp',
      quote: m.nav.quote
    }
  };
}

export const uiCopy: Record<Locale, UiCopy> = {
  en,
  es: localizedCopy('es'),
  de: localizedCopy('de'),
  ru: localizedCopy('ru'),
  ar: localizedCopy('ar'),
  fr: localizedCopy('fr'),
  pt: localizedCopy('pt')
};
