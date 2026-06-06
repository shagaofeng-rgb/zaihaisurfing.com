export const supportPageSlugs = ['faq', 'shipping', 'warranty', 'returns', 'privacy', 'terms'] as const;
export type SupportPageSlug = (typeof supportPageSlugs)[number];

export const supportPages: Record<SupportPageSlug, {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{title: string; text: string}>;
}> = {
  faq: {
    eyebrow: 'Buyer support',
    title: 'Frequently Asked Questions',
    intro: 'Key answers for overseas buyers comparing ZAIHAI surfboards, go-kart boats, sample orders, shipping and after-sales support.',
    sections: [
      {title: 'Can I order one sample first?', text: 'Yes. Sample orders can be arranged for model evaluation. Final shipping cost depends on destination, product type and selected freight method.'},
      {title: 'Which products are suitable for rental fleets?', text: 'X1 and Rage Shark X are often easier for commercial programs. X1 Pro and P1 Pro are better for premium or advanced positioning.'},
      {title: 'Do you support OEM/ODM?', text: 'Logo, color, packaging and distributor catalog support can be discussed based on order quantity and project requirements.'},
      {title: 'How are lithium batteries shipped?', text: 'Battery shipment needs destination-specific freight planning. ZAIHAI can provide packing details and battery document support where available.'},
      {title: 'How do I get spare parts?', text: 'Spare battery, charger, wear parts and accessory planning can be included in a quotation for commercial operators.'}
    ]
  },
  shipping: {
    eyebrow: 'Shipping support',
    title: 'Shipping and Delivery',
    intro: 'ZAIHAI confirms freight options by destination country, quantity, product type, packaging size and battery requirements before final shipment.',
    sections: [
      {title: 'Shipping quote', text: 'Product checkout shows an estimated freight amount for selected countries. Final freight may be confirmed by the sales team before dispatch.'},
      {title: 'Delivery methods', text: 'Sea freight, air freight or buyer-appointed forwarder pickup can be discussed depending on destination and product category.'},
      {title: 'Battery and fuel-board handling', text: 'Electric products and fuel-powered products may require different export handling, documents and forwarder confirmation.'},
      {title: 'Packing confirmation', text: 'Packing list, product package photos and shipping dimensions can be shared before shipment when needed.'}
    ]
  },
  warranty: {
    eyebrow: 'After-sales',
    title: 'Warranty Policy',
    intro: 'Warranty handling is based on the confirmed product model, purchase record, use environment and issue diagnosis.',
    sections: [
      {title: 'Standard coverage', text: 'Main product warranty terms are confirmed in the final quotation or invoice. Wear parts, misuse, impact damage and unauthorized modification are not normally covered.'},
      {title: 'Diagnosis process', text: 'Customers should provide order number, product model, photos, video and a clear issue description so the team can identify the cause.'},
      {title: 'Commercial fleets', text: 'Rental fleets and distributors should keep operating records and maintenance notes to support faster after-sales handling.'},
      {title: 'Support channel', text: 'Contact davidsha@zaihaisurfing.com or WhatsApp +86 17621485205 for warranty and technical support.'}
    ]
  },
  returns: {
    eyebrow: 'After-sales',
    title: 'Returns and After-Sales',
    intro: 'Because ZAIHAI products are high-value water sports equipment, returns and replacement handling must be confirmed case by case.',
    sections: [
      {title: 'Before shipment', text: 'If an order has not shipped, contact the team as soon as possible to discuss changes, cancellation or destination updates.'},
      {title: 'After shipment', text: 'Return feasibility depends on product condition, freight route, battery or fuel-board restrictions, customs status and the reason for return.'},
      {title: 'Damaged shipment', text: 'Keep packaging, take clear photos and videos, and contact ZAIHAI immediately so logistics and after-sales review can start.'},
      {title: 'Replacement parts', text: 'For suitable cases, spare parts or accessories may be a faster solution than returning the whole product internationally.'}
    ]
  },
  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro: 'ZAIHAI collects only the information needed to answer inquiries, process orders, arrange payment, provide shipping support and improve website service.',
    sections: [
      {title: 'Information collected', text: 'We may collect name, email, phone, company, country, shipping details, order details, inquiry content and website interaction data.'},
      {title: 'How information is used', text: 'Information is used for quotations, order service, payment and shipping coordination, account support and customer communication.'},
      {title: 'Data sharing', text: 'Relevant order or shipping information may be shared with payment, logistics, email or technical service providers only when needed for service delivery.'},
      {title: 'Contact', text: 'For privacy questions, contact davidsha@zaihaisurfing.com.'}
    ]
  },
  terms: {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    intro: 'These terms describe the basic conditions for using the ZAIHAI website, submitting inquiries and placing product orders.',
    sections: [
      {title: 'Product information', text: 'Product images, specifications and prices are provided for buyer evaluation. Final confirmed details are subject to quotation, invoice and order confirmation.'},
      {title: 'Orders and payment', text: 'Orders may require payment gateway confirmation, risk review, destination verification and shipping confirmation before dispatch.'},
      {title: 'Use and safety', text: 'Water sports products should be used with suitable safety equipment, trained supervision and compliance with local rules.'},
      {title: 'Contact', text: 'For service questions, contact davidsha@zaihaisurfing.com.'}
    ]
  }
};
