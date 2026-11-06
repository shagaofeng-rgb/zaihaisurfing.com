import type {ProductSlug} from '@/lib/site';

type FrenchPresentation = {
  description: string;
  title: string;
  story: string;
  detailLabel: string;
  use: string[];
  included: string[];
  optional: string[];
  handover: string[];
  questions: [string, string][];
};

export const frenchProductPresentation: Record<ProductSlug, FrenchPresentation> = {
  x1: {
    description: 'Une planche de surf électrique pour les flottes de location, les démonstrations en station et les distributeurs.',
    title: 'Une planche électrique pour les sorties régulières',
    story: 'Le X1 associe un moteur de 10 kW à une batterie de 50 Ah à retrait rapide. Pour une flotte de location, évaluez le profil des utilisateurs et l’organisation de la recharge quotidienne.',
    detailLabel: 'Détail de la poupe et de la propulsion du X1',
    use: ['Flottes de location', 'Démonstrations en station', 'Échantillons pour distributeurs'],
    included: ['Planche électrique X1', 'Batterie et chargeur', 'Ensemble d’accessoires standard'],
    optional: ['Batterie et chargeur de rechange', 'Options de logo et de couleur', 'Emballage pour distributeur'],
    handover: ['Confirmer la configuration commandée', 'Vérifier les conditions de transport de la batterie', 'Valider l’emballage avant l’expédition'],
    questions: [
      ['Quelle est l’autonomie annoncée ?', 'L’autonomie annoncée est de 60 à 80 minutes. Elle varie avec la vitesse, le poids de l’utilisateur, l’état de l’eau et celui de la batterie.'],
      ['Puis-je demander une unité d’essai ?', 'Indiquez la destination, l’usage et la quantité pour confirmer la configuration et les frais de transport.'],
      ['Comment préparer une flotte de location ?', 'Vérifiez avec l’équipe commerciale les critères d’utilisation, le nombre de batteries de rechange et les besoins de recharge.']
    ]
  },
  'x1-pro': {
    description: 'Une planche de surf électrique de 12 kW destinée aux démonstrations haut de gamme et aux utilisateurs expérimentés.',
    title: 'Comparer les performances du X1 Pro',
    story: 'Le X1 Pro est doté d’un moteur de 12 kW et sa vitesse maximale annoncée atteint 61 km/h. Comparez son autonomie annoncée et son indice IP67 avec les caractéristiques du X1.',
    detailLabel: 'Détail de la planche X1 Pro',
    use: ['Stations haut de gamme', 'Clubs nautiques', 'Salles d’exposition'],
    included: ['Planche X1 Pro et système de propulsion associé', 'Ensemble d’accessoires adapté', 'Liste exacte à confirmer sur le devis'],
    optional: ['Batterie et chargeur de rechange', 'Logo ou couleur personnalisés', 'Configuration pour démonstration en station'],
    handover: ['Vérifier les zones étanches et la fixation de la batterie', 'Valider les photos de l’emballage et les documents', 'Définir les besoins en pièces et en assistance'],
    questions: [
      ['Quelles différences avec le X1 ?', 'Le X1 Pro possède un moteur de 12 kW, une vitesse maximale annoncée plus élevée et un indice IP67 publié. Le X1 affiche une autonomie annoncée plus longue.'],
      ['Quelle est l’autonomie annoncée ?', '45 minutes. La durée réelle dépend de la vitesse, de la charge, de l’état de l’eau et de la batterie.'],
      ['Convient-il aux démonstrations ?', 'Le X1 Pro peut être évalué pour des utilisateurs expérimentés, avec supervision et zone de navigation définie.']
    ]
  },
  'rage-shark-x': {
    description: 'Un kart nautique électrique à siège pour les parcours surveillés, les parcs aquatiques et les stations de loisirs.',
    title: 'Évaluer la coque et la direction',
    story: 'Le siège, la direction et la forme de la coque guident le choix d’une attraction nautique. Définissez le parcours, la supervision et la recharge avant de fixer la taille de la flotte.',
    detailLabel: 'Coque et direction du Rage Shark X',
    use: ['Parcs aquatiques', 'Plans d’eau de loisirs', 'Attractions en station'],
    included: ['Coque Rage Shark X et système électrique', 'Batterie et chargeur', 'Gilet de sauvetage et accessoires adaptés'],
    optional: ['Recharge de la flotte et batteries de rechange', 'Coordination du transport de plusieurs unités', 'Documentation produit pour distributeurs'],
    handover: ['Vérifier la coque, la direction et le système électrique', 'Confirmer la zone d’utilisation et les besoins de recharge', 'Valider l’emballage et la logistique'],
    questions: [
      ['Que doit vérifier un parc aquatique ?', 'Confirmez le parcours, la supervision, les critères d’accès, le port du gilet, la recharge et les règles locales.'],
      ['Quelle est l’autonomie annoncée ?', '60 à 80 minutes. La durée réelle dépend des conditions d’utilisation et de l’entretien de la batterie.'],
      ['Quels accessoires sont prévus ?', 'La fiche indique une batterie, un chargeur, un gilet de sauvetage et des accessoires adaptés. Confirmez les quantités sur le devis.']
    ]
  },
  p1: {
    description: 'Une planche de surf motorisée à essence pour les exploitants qui évaluent le ravitaillement et l’entretien sur site.',
    title: 'Prévoir le carburant et l’entretien',
    story: 'Le P1 est équipé d’un moteur deux temps de 110 cm³ refroidi par eau. Vérifiez le carburant, l’organisation du ravitaillement et les consignes d’entretien pour votre zone d’activité.',
    detailLabel: 'Détail de la poupe et de la propulsion du P1',
    use: ['Activités nautiques de plein air', 'Clubs de plage', 'Distributeurs de planches à essence'],
    included: ['Planche P1 et système moteur', 'Ensemble d’accessoires standard', 'Liste des pièces à confirmer sur le devis'],
    optional: ['Ensemble de pièces de rechange', 'Accompagnement pour l’entretien', 'Transport d’une unité d’essai ou de plusieurs unités'],
    handover: ['Vérifier le moteur et les fixations', 'Confirmer la manutention et l’emballage', 'Consulter les consignes d’utilisation et d’entretien'],
    questions: [
      ['Quel carburant utiliser ?', 'La fiche indique une essence sans plomb d’indice 95 ou supérieur et un mélange de 50:1. Suivez le guide fourni avec la planche.'],
      ['Que signifie 3,5 L ?', 'Il s’agit du volume du réservoir. L’autonomie varie selon l’accélération, la charge et l’état de l’eau.'],
      ['Quelles différences avec le P1 Pro ?', 'Les fiches indiquent des vitesses maximales et des poids différents. Comparez-les en fonction de votre environnement d’exploitation.']
    ]
  },
  'p1-pro': {
    description: 'Une planche de surf motorisée à essence pour les exploitants expérimentés et les distributeurs qui recherchent la configuration Pro.',
    title: 'Évaluer la configuration Pro',
    story: 'Le P1 Pro affiche une vitesse maximale annoncée de 64 km/h et un poids de 22 kg. Tenez également compte du carburant, des pièces de rechange et de l’assistance à l’exploitation.',
    detailLabel: 'Ensemble de propulsion arrière du P1 Pro',
    use: ['Location haut de gamme en plein air', 'Tourisme d’aventure', 'Salles d’exposition de distributeurs'],
    included: ['Planche P1 Pro et moteur associé', 'Ensemble d’accessoires standard', 'Liste des pièces à confirmer sur le devis'],
    optional: ['Pièces de rechange et consommables', 'Documentation pour distributeurs', 'Quantités pour essai ou projet'],
    handover: ['Vérifier la planche, les fixations et les accessoires', 'Valider l’emballage et la liste de colisage', 'Confirmer le transport vers la destination'],
    questions: [
      ['Quelles différences entre le P1 Pro et le P1 ?', 'Le P1 Pro est annoncé à 64 km/h pour 22 kg. Le P1 est annoncé à 62 km/h pour 22,5 kg.'],
      ['Quel moteur et quel carburant ?', 'La fiche indique un moteur deux temps de 110 cm³ refroidi par eau, une essence sans plomb d’indice 95 ou supérieur, un mélange de 50:1 et un réservoir de 3,5 L.'],
      ['Comment organiser l’entretien ?', 'Lors du devis, indiquez les pièces recherchées, les conditions d’utilisation et le pays où vous avez besoin d’assistance.']
    ]
  }
};

const frenchSpecLabels: Record<string, string> = {
  'Model': 'Modèle', 'Motor power': 'Puissance du moteur', 'Voltage': 'Tension', 'Board size': 'Dimensions de la planche',
  'Battery capacity': 'Capacité de la batterie', 'Battery weight': 'Poids de la batterie', 'Material': 'Matériau',
  'Top speed': 'Vitesse maximale', 'Endurance': 'Autonomie', 'Highlights': 'Points forts', 'Waterproof rating': 'Indice d’étanchéité',
  'Product type': 'Type de produit', 'Hull size': 'Dimensions de la coque', 'Rated power': 'Puissance nominale',
  'Rated voltage': 'Tension nominale', 'Hull weight': 'Poids de la coque', 'Speed': 'Vitesse',
  'Standard accessories': 'Accessoires standard', 'Power': 'Puissance', 'Max speed': 'Vitesse maximale',
  'Recommended operating power': 'Régime recommandé', 'Max load': 'Charge maximale', 'Gasoline': 'Carburant',
  'Fuel ratio': 'Rapport du mélange', 'Fuel tank volume': 'Volume du réservoir', 'Engine type': 'Type de moteur',
  'Engine displacement': 'Cylindrée', 'Ignition mode': 'Allumage', 'Compression ratio': 'Taux de compression',
  'Recommended lubricating oil': 'Huile recommandée', 'Spark plug': 'Bougie', 'Cylinder diameter x stroke': 'Alésage × course',
  'Board weight': 'Poids de la planche', 'Board packing size': 'Dimensions du colis', 'Start mode': 'Démarrage',
  'Warranty': 'Garantie', 'Motor': 'Moteur', 'Listed speed': 'Vitesse annoncée', 'Battery': 'Batterie',
  'Listed ride time': 'Autonomie annoncée', 'Published rating': 'Indice publié', 'Listed max speed': 'Vitesse maximale annoncée',
  'Displacement': 'Cylindrée', 'Tank volume': 'Volume du réservoir', 'Fuel tank': 'Réservoir'
};

const frenchSpecValues: Record<string, string> = {
  'Fully solid board, no drainage required; quick-release battery; sun-resistant textured surface': 'Planche pleine, sans drainage nécessaire. Batterie à retrait rapide et surface texturée résistante au soleil.',
  'Fully solid board, no drainage required; quick-release battery; IP67 waterproof structure': 'Planche pleine, sans drainage nécessaire. Batterie à retrait rapide et structure d’indice IP67.',
  'IP67 waterproof': 'Indice IP67',
  '15 kW electric go-kart boat': 'Kart nautique électrique de 15 kW',
  'Battery, charger, life jacket and matched accessory package': 'Batterie, chargeur, gilet de sauvetage et accessoires adaptés',
  'Unleaded gasoline No.95 and above': 'Essence sans plomb d’indice 95 ou supérieur',
  'Two-stroke water-cooled engine': 'Moteur deux temps refroidi par eau',
  'CDI igniter': 'Allumage CDI',
  'Fully synthetic 2T lubricating oil': 'Huile de synthèse pour moteur deux temps',
  'Electric start': 'Démarrage électrique',
  '12 months': '12 mois'
};

export function productLabel(label: string, french: boolean) {
  return french ? frenchSpecLabels[label] || label : label;
}

export function productSpecValue(value: string, french: boolean) {
  if (!french) return value;
  return frenchSpecValues[value] || value.replace(/(\d)\.(\d)/g, '$1,$2').replace(/(\d)-(\d)/g, '$1–$2')
    .replace(' minutes', ' min').replace(' rpm', ' tr/min').replace(' cc', ' cm³');
}

export const frenchProductTypes = {
  electric: 'Planche de surf électrique',
  fuel: 'Planche de surf motorisée à essence',
  kart: 'Kart nautique électrique'
};
