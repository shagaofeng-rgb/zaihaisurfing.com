import type {ProductSlug} from '@/lib/site';
import type {VisualIconName} from '@/components/VisualIcon';

type ProductPresentation = {
  short: string;
  type: string;
  category: 'electric' | 'fuel' | 'kart';
  description: string;
  title: string;
  story: string;
  detail: string;
  detailLabel: string;
  use: readonly string[];
  key: readonly (readonly [VisualIconName, string, string])[];
  included: readonly string[];
  optional: readonly string[];
  handover: readonly string[];
  questions: readonly (readonly [string, string])[];
  compare: ProductSlug | null;
};

export const productPresentation = {
  x1: {
    short:'ZAIHAI X1', type:'Electric surfboard', category:'electric',
    description:'A balanced electric board for rental fleets, resort demos and distributor catalogs.',
    title:'A practical electric board for repeat rides.',
    story:'Start with the riders and the daily charging routine. X1 combines a 10 kW drive, 50 Ah battery and quick-release battery access for rental and resort evaluation.',
    detail:'/assets/catalog/x1/tail-closeup.png', detailLabel:'X1 tail and drive detail',
    use:['Rental fleets','Resort demos','Distributor samples'],
    key:[['power','Motor','10 kW'],['speed','Listed speed','0–51 km/h'],['battery','Battery','50 Ah'],['time','Listed ride time','60–80 min']],
    included:['X1 electric board','Battery and charger','Standard accessory package'],
    optional:['Spare battery and charger','Logo or color options','Distributor packaging'],
    handover:['Confirm order configuration','Review battery freight requirements','Review packing details before dispatch'],
    questions:[['How long does the battery last?','The listed range is 60–80 minutes. Actual time varies with speed, rider, water and battery conditions.'],['Can I request a sample?','Share destination, expected use and quantity to confirm a sample configuration and freight.'],['How do I plan a rental fleet?','Discuss rider screening, spare packs and daily charging with the sales team.']],
    compare:'x1-pro'
  },
  'x1-pro': {
    short:'ZAIHAI X1 Pro', type:'Electric surfboard', category:'electric',
    description:'A performance electric model for premium demos, experienced riders and flagship displays.',
    title:'Performance that buyers can compare.',
    story:'A 12 kW electric drive and listed top speed of 61 km/h distinguish X1 Pro. Compare the shorter listed ride time and the published IP67 rating alongside the original X1.',
    detail:'/assets/catalog/x1-pro/detail-closeup.png', detailLabel:'X1 Pro board detail',
    use:['Premium resorts','Yacht clubs','Flagship showrooms'],
    key:[['power','Motor','12 kW'],['speed','Listed speed','0–61 km/h'],['time','Listed ride time','45 min'],['shield','Published rating','IP67']],
    included:['X1 Pro board and matched power system','Matched accessory package','Confirm exact packing list with sales'],
    optional:['Spare battery and charger planning','OEM logo or color discussion','Resort demo configuration'],
    handover:['Review waterproof areas and battery mount','Confirm packing photos and documents','Align support and spare-parts needs'],
    questions:[['How is it different from X1?','X1 Pro has a 12 kW drive, a higher listed top speed and a published IP67 rating. X1 has a longer listed ride time.'],['What riding time is listed?','45 minutes. Actual time varies with riding speed, load, water and battery condition.'],['Is it intended for premium demos?','It can be evaluated for experienced riders, with staff supervision and a defined operating area.']],
    compare:'x1'
  },
  'rage-shark-x': {
    short:'Rage Shark X', type:'Electric go-kart boat', category:'kart',
    description:'A seated electric water attraction for controlled routes, water parks and resort programs.',
    title:'Start with the hull and steering.',
    story:'The seat, steering and hull shape are the key evaluation points for a guest attraction. Plan the route, supervision and charging workflow before setting fleet size.',
    detail:'/assets/catalog/rage-shark-x/head-closeup.png', detailLabel:'Rage Shark X hull and steering detail',
    use:['Water parks','Scenic lakes','Resort attractions'],
    key:[['power','Motor','15 kW'],['battery','Battery','76 Ah'],['speed','Listed speed','0–51 km/h'],['time','Listed ride time','60–80 min']],
    included:['Rage Shark X hull and electric system','Battery and charger','Life jacket and matched accessories'],
    optional:['Fleet charging and spare-pack planning','Multi-unit shipping coordination','Distributor product materials'],
    handover:['Review hull, steering and power system','Confirm charging and operating area','Confirm packing and logistics'],
    questions:[['What should a water park confirm first?','Confirm the route, supervision, rider criteria, life-jacket policy, charging and local rules.'],['What is the listed runtime?','60–80 minutes. Actual runtime depends on operating conditions and battery maintenance.'],['Which accessories are listed?','The specifications list a battery, charger, life jacket and matched accessory package. Confirm quantities on the quote.']],
    compare:null
  },
  p1: {
    short:'ZAIHAI P1', type:'Fuel-powered surfboard', category:'fuel',
    description:'A fuel-powered board for outdoor operators evaluating refueling and maintenance needs.',
    title:'Fuel, engine and service in one view.',
    story:'The P1 uses a 110 cc water-cooled two-stroke engine. Review fuel requirements, refueling workflow and maintenance information when evaluating it for an outdoor operation.',
    detail:'/assets/catalog/p1/tail-closeup.png', detailLabel:'P1 tail and propulsion detail',
    use:['Adventure operations','Beach clubs','Fuel-board distributors'],
    key:[['speed','Listed max speed','62 km/h'],['engine','Displacement','110 cc'],['fuel','Tank volume','3.5 L'],['power','Power','10.5 kW']],
    included:['P1 board and engine system','Standard accessory package','Confirm individual items on the quote'],
    optional:['Spare parts package discussion','Operator maintenance support','Sample or multi-unit shipping'],
    handover:['Review engine and fittings','Confirm destination handling and packing','Review operating and maintenance notes'],
    questions:[['What fuel does P1 use?','The product sheet lists unleaded gasoline No. 95 and above and a 50:1 fuel ratio. Follow the supplied operation guidance.'],['Is 3.5 L an endurance value?','It is the fuel tank volume. Runtime varies with throttle, rider load and water conditions.'],['What differs from P1 Pro?','The listed top speed and board weight differ. Review both specification sheets and the operating environment.']],
    compare:'p1-pro'
  },
  'p1-pro': {
    short:'ZAIHAI P1 Pro', type:'Fuel-powered surfboard', category:'fuel',
    description:'The premium fuel board for experienced operators and distributor showroom positioning.',
    title:'A closer look at the Pro configuration.',
    story:'P1 Pro lists a 64 km/h maximum speed and a 22 kg board weight. The fuel setup, spare parts and operator support belong alongside those figures in a purchase evaluation.',
    detail:'/assets/catalog/p1-pro/scene-01.png', detailLabel:'P1 Pro rear propulsion assembly',
    use:['Premium outdoor rentals','Adventure tourism','Distributor showrooms'],
    key:[['speed','Listed max speed','64 km/h'],['engine','Displacement','110 cc'],['fuel','Tank volume','3.5 L'],['size','Board weight','22 kg']],
    included:['P1 Pro board and matched engine','Standard accessory package','Confirm individual items on the quote'],
    optional:['Spare parts and consumables','Distributor catalog materials','Sample or project quantities'],
    handover:['Check board structure, fittings and accessories','Confirm packaging and packing list','Coordinate destination freight with sales'],
    questions:[['What distinguishes P1 Pro from P1?','P1 Pro lists 64 km/h maximum speed and a 22 kg board weight. P1 lists 62 km/h and 22.5 kg.'],['What are the engine and fuel specifications?','The catalog lists a 110 cc water-cooled two-stroke, unleaded No. 95 or higher, 50:1 mix and a 3.5 L tank.'],['What maintenance information is available?','Discuss spare parts, the operating environment and destination-specific support when requesting a quote.']],
    compare:'p1'
  }
} as const satisfies Record<ProductSlug, ProductPresentation>;

export const seriesFields = {
  electric: [['Power', 'Motor power'], ['Top speed', 'Top speed'], ['Battery', 'Battery capacity'], ['Listed ride time', 'Endurance']],
  fuel: [['Power', 'Power'], ['Max speed', 'Max speed'], ['Fuel tank', 'Fuel tank volume'], ['Board weight', 'Board weight']]
} as const;

export const summaryFields = {
  x1: ['Motor power', 'Top speed', 'Battery capacity', 'Endurance'],
  'x1-pro': ['Motor power', 'Top speed', 'Endurance', 'Waterproof rating'],
  'rage-shark-x': ['Rated power', 'Battery capacity', 'Speed', 'Endurance'],
  p1: ['Max speed', 'Engine displacement', 'Fuel tank volume', 'Power'],
  'p1-pro': ['Max speed', 'Engine displacement', 'Fuel tank volume', 'Board weight']
} satisfies Record<ProductSlug, string[]>;
