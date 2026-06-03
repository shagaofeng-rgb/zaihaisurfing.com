export type NewsArticle = {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  hero: string;
  tags: string[];
  sources: {name: string; url: string; note: string}[];
  body: {heading: string; paragraphs: string[]}[];
  productFit: string;
};

export const newsArticles: NewsArticle[] = [
  {
    slug: 'middle-east-luxury-tourism-water-attractions',
    date: '2026-05-31',
    title: 'Middle East Luxury Tourism Growth Creates Demand for Premium Water Attractions',
    excerpt:
      'WTTC reports strong regional travel growth, while Red Sea yacht destinations such as Sindalah show why resorts and marinas need memorable water experiences.',
    hero: '/assets/banners/surfing-rider-01.png',
    tags: ['Middle East', 'Resorts', 'Yacht Clubs'],
    sources: [
      {
        name: 'WTTC Middle East Economic Impact Research 2026',
        url: 'https://wttc.org/news/middle-east-eir',
        note: 'Used for Middle East travel and tourism growth context.'
      },
      {
        name: 'NEOM Sindalah opening announcement',
        url: 'https://www.neom.com/en-us/newsroom/neom-board-of-directors-showcases-opening-of-sindalah',
        note: 'Used for Red Sea luxury island and marina development context.'
      }
    ],
    body: [
      {
        heading: 'What happened',
        paragraphs: [
          "The Middle East continues to stand out as one of the most active travel and tourism regions. WTTC reported that the region expanded faster than the global travel average in 2025, with Saudi Arabia playing a central role in the region's momentum.",
          "At the same time, projects such as NEOM's Sindalah show how new coastal destinations are being built around marinas, yacht clubs, luxury hospitality and curated guest experiences."
        ]
      },
      {
        heading: 'Why it matters for water sports buyers',
        paragraphs: [
          'For resorts, yacht clubs and tourism developers, water equipment is no longer just a rental add-on. It is part of the guest experience, photo content, membership value and destination differentiation.',
          'Electric surfboards and electric go-kart boats fit this trend because they are visually strong, easy to explain to guests and suitable for high-value waterfront operations.'
        ]
      },
      {
        heading: 'ZAIHAI product angle',
        paragraphs: [
          'ZAIHAI X1 Pro is positioned for premium riders and high-impact resort demos, while Rage Shark X works as a more accessible attraction for family users, scenic areas and water parks.',
          'For GCC distributors, the key buying logic is not only speed. Buyers also need packaging, training support, spare parts planning and model comparison for different tourist groups.'
        ]
      }
    ],
    productFit: 'Best matched with ZAIHAI X1 Pro and Rage Shark X for resort, yacht club and Red Sea-style tourism projects.'
  },
  {
    slug: 'electric-boating-growth-rental-fleets',
    date: '2026-05-31',
    title: 'Electric Boating Growth Points to a Bigger Rental Fleet Opportunity',
    excerpt:
      'Electric boats and smaller electric watercraft are gaining attention as lakes, marinas and rental operators look for cleaner and easier guest experiences.',
    hero: '/assets/banners/surfing-rider-03.png',
    tags: ['Electric Boating', 'Rentals', 'Marinas'],
    sources: [
      {
        name: 'Grand View Research U.S. Electric Boat Market Report',
        url: 'https://www.grandviewresearch.com/industry-analysis/us-electric-boat-market-report',
        note: 'Used for electric boat market size, growth and leisure segment context.'
      },
      {
        name: 'Leisure Properties Group 2026 Marina Investment Report',
        url: 'https://www.leisurepropertiesgroup.com/wp-content/uploads/2026/03/2026-Marina-Investment-Report-Final-2.pdf',
        note: 'Used for marina occupancy, shared access models and technology adoption context.'
      }
    ],
    body: [
      {
        heading: 'What happened',
        paragraphs: [
          'Market research continues to point to growth in electric boating, especially in leisure and inland-water use cases. Grand View Research projects a strong growth path for the U.S. electric boat market from 2025 to 2030.',
          'The marina investment discussion is also shifting toward shared access, digital booking, payments and higher utilization of waterfront space.'
        ]
      },
      {
        heading: 'Why it matters for rental operators',
        paragraphs: [
          'Rental buyers usually care about repeat use, learning curve, charging or fuel workflow, guest safety, maintenance and visual appeal. A product that creates short, exciting sessions can help operators increase ride turnover.',
          'Smaller electric watercraft can also fit locations where full-size boat operation is too expensive, too complex or too space-intensive.'
        ]
      },
      {
        heading: 'ZAIHAI product angle',
        paragraphs: [
          'For lake rentals and marina entertainment zones, Rage Shark X can serve as an easy-drive go-kart boat attraction, while X1 and X1 Pro target riders who want a faster board experience.',
          'The best purchase plan usually separates beginner-friendly fleet products from premium demo products, then adds spare batteries, chargers, protective gear and maintenance parts.'
        ]
      }
    ],
    productFit: 'Best matched with Rage Shark X for rental fleets and X1/X1 Pro for premium ride upgrades.'
  },
  {
    slug: 'electric-surfboard-market-commercial-resorts',
    date: '2026-05-31',
    title: 'Electric Surfboards Are Moving From Niche Toys to Commercial Resort Assets',
    excerpt:
      'New market commentary shows electric surfboards gaining commercial relevance as resorts, rentals and coastal projects look for premium water sports products.',
    hero: '/assets/catalog/x1-pro/product.png',
    tags: ['Electric Surfboards', 'Commercial Rentals', 'Product Selection'],
    sources: [
      {
        name: 'Claritas Intelligence Electric Surfboard Market Press Release',
        url: 'https://claritasintelligence.com/press-release/global-electric-surfboard-market',
        note: 'Used for electric surfboard market growth and commercial rental/luxury resort context.'
      },
      {
        name: 'ShoreMaster State of the Waterfront Industry 2026',
        url: 'https://www.shoremaster.com/blog/articles/state-of-the-waterfront-industry-2026-key-trends-in-docks-lifts-and-marinas/',
        note: 'Used for waterfront lifestyle, rentals and PWC/accessory demand context.'
      }
    ],
    body: [
      {
        heading: 'What happened',
        paragraphs: [
          'Recent electric surfboard market commentary describes the category as moving beyond a niche enthusiast product. Commercial rental services and luxury resorts are increasingly discussed as important growth applications.',
          'Waterfront operators are also rethinking docks and launch areas as multi-use recreation platforms rather than simple storage infrastructure.'
        ]
      },
      {
        heading: 'Why it matters for buyers',
        paragraphs: [
          'This changes the way buyers should compare products. A commercial buyer should evaluate power, riding time, waterproof design, battery workflow, safety accessories, training difficulty and after-sales parts support.',
          'A high-speed board may be attractive for marketing videos, but a complete commercial package also needs clear SOPs for charging, guest screening, operator training and daily inspection.'
        ]
      },
      {
        heading: 'ZAIHAI product angle',
        paragraphs: [
          'ZAIHAI X1 Pro is suitable for premium demos and advanced users, while X1 can be positioned as a volume model for resorts and rental packages.',
          'For distributors, pairing electric surfboards with go-kart boats can create a broader catalog: one product line for high-speed riders and another for family-friendly attractions.'
        ]
      }
    ],
    productFit: 'Best matched with X1 Pro for premium demos and X1 for wider rental or resort packages.'
  }
];

export const newsSlugs = newsArticles.map((article) => article.slug);

export function getNewsArticle(slug: string) {
  return newsArticles.find((article) => article.slug === slug);
}
