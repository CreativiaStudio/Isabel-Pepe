/**
 * Isabel Pepe — Centralized Schema.org & Knowledge Graph Generator
 * Adheres to Google Search Central Rich Results & Schema.org 2026 standards.
 */

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.isabelpepe.com';
export const ORG_ID = `${BASE_URL}/#organization`;
export const WEBSITE_ID = `${BASE_URL}/#website`;
export const LOGO_URL = `${BASE_URL}/Brand/logo-isabel-pepe.png`;

export interface ProductSchemaInput {
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  seo_description?: string;
  price: number;
  discount_price?: number | null;
  category?: string;
  materials?: string;
  plating?: string;
  gemstone?: string;
  carats?: string;
  image_primary?: string;
  gallery?: string[];
  is_active?: boolean;
}

export function getOrganizationAndWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'JewelryStore', 'OnlineBusiness'],
        '@id': ORG_ID,
        name: 'Isabel Pepe',
        legalName: 'Creativia Digital Studio di Mario Pepe',
        alternateName: [
          'Isabel Pepe Gioielli',
          'Isabel Pepe Demi-Fine Jewelry',
          'Isabel Pepe Atelier',
        ],
        url: BASE_URL,
        logo: {
          '@type': 'ImageObject',
          '@id': `${BASE_URL}/#logo`,
          url: LOGO_URL,
          caption: 'Isabel Pepe Logo Ufficiale',
          width: 800,
          height: 800,
        },
        image: `${BASE_URL}/Brand/chi_siamo_hero.jpg`,
        description:
          'Atelier italiano di alta gioielleria demi-fine in Argento Sterling 925, placcatura Oro 18K a spessore (1.0µm) ed E-Coating nano-protettivo. Packaging luxury con cofanetto regalo incluso e donazione del 5% per la salvaguardia degli animali.',
        slogan: "L'Arte di Splendere",
        email: 'info@isabelpepe.com',
        telephone: '+39 089 000000',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Via Casa Gallo di Giovi Santo Stefano 23',
          addressLocality: 'Salerno',
          addressRegion: 'SA',
          postalCode: '84133',
          addressCountry: 'IT',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 40.71,
          longitude: 14.78,
        },
        vatID: 'IT06399670659',
        taxID: 'PPEMRA83L15F205G',
        founder: [
          {
            '@type': 'Person',
            name: 'Elena',
            jobTitle: 'Co-Founder & Creative Director',
          },
          {
            '@type': 'Person',
            name: 'Mario Pepe',
            jobTitle: 'Co-Founder & Managing Director',
          },
        ],
        foundingLocation: {
          '@type': 'Place',
          name: 'Salerno, Italia',
        },
        priceRange: '€€',
        currenciesAccepted: 'EUR',
        paymentAccepted:
          'Credit Card, Apple Pay, Google Pay, PayPal, Klarna, Scalapay',
        sameAs: [
          'https://instagram.com/isabelpepe',
          'https://tiktok.com/@isabelpepe',
          'https://pinterest.com/isabelpepe',
          'https://facebook.com/isabelpepe',
        ],
        knowsAbout: [
          'Gioielli Demi-Fine',
          'Argento Sterling 925',
          'Placcatura Oro 18K a Spessore (1.0 Micron)',
          'Trattamento Nano-Protective E-Coating',
          'Moissanite Certificata GRA VVS1 D-Color',
          "Perle d'Acqua Dolce Naturali",
          'Regali di Lusso per Donna',
          'Idee Regalo Anniversario e Compleanno',
          'Tutela e Salvaguardia degli Animali',
        ],
        award:
          '5% di ogni vendita devoluto direttamente a volontari indipendenti per la cura degli animali in difficoltà',
        ethicsPolicy: `${BASE_URL}/impegno-animali`,
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          '@id': `${BASE_URL}/spedizioni-resi#return-policy`,
          applicableCountry: 'IT',
          returnPolicyCategory:
            'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 14,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
          refundType: 'https://schema.org/FullRefund',
        },
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: BASE_URL,
        name: 'Isabel Pepe',
        alternateName: 'Isabel Pepe Gioielli',
        publisher: {
          '@id': ORG_ID,
        },
        inLanguage: 'it-IT',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/shop?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

export function getProductPageSchema(
  product: ProductSchemaInput,
  allImages: string[]
) {
  const effectivePrice =
    product.discount_price &&
    product.discount_price > 0 &&
    product.discount_price < product.price
      ? Number(product.discount_price)
      : Number(product.price);

  const productImages =
    allImages.length > 0
      ? allImages.filter(Boolean)
      : [product.image_primary].filter(Boolean) as string[];

  const canonicalProductUrl = `${BASE_URL}/prodotto/${product.slug}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${canonicalProductUrl}#product`,
        name: product.name,
        description: product.seo_description || product.description || '',
        url: canonicalProductUrl,
        image: productImages,
        sku: product.sku || product.slug,
        mpn: product.sku || product.slug,
        category: `Jewelry > ${product.category || 'Gioielli'}`,
        material:
          'Argento Sterling 925 Nichel-Free con placcatura Oro 18K (1.0µm) / Rodio Puro ed E-Coating',
        brand: {
          '@type': 'Brand',
          name: 'Isabel Pepe',
          url: BASE_URL,
        },
        manufacturer: {
          '@id': ORG_ID,
        },
        itemCondition: 'https://schema.org/NewCondition',
        offers: {
          '@type': 'Offer',
          '@id': `${canonicalProductUrl}#offer`,
          price: effectivePrice.toFixed(2),
          priceCurrency: 'EUR',
          priceValidUntil: '2027-12-31',
          availability:
            product.is_active !== false
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: canonicalProductUrl,
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@id': ORG_ID,
          },
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            '@id': `${BASE_URL}/spedizioni-resi#shipping-details`,
            shippingRate: {
              '@type': 'MonetaryAmount',
              value: '0.00',
              currency: 'EUR',
            },
            shippingDestination: {
              '@type': 'DefinedRegion',
              addressCountry: 'IT',
            },
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: {
                '@type': 'QuantitativeValue',
                minValue: 0,
                maxValue: 1,
                unitCode: 'DAY',
              },
              transitTime: {
                '@type': 'QuantitativeValue',
                minValue: 1,
                maxValue: 2,
                unitCode: 'DAY',
              },
            },
          },
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            '@id': `${BASE_URL}/spedizioni-resi#return-policy`,
            applicableCountry: 'IT',
            returnPolicyCategory:
              'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 14,
            returnMethod: 'https://schema.org/ReturnByMail',
            returnFees: 'https://schema.org/FreeReturn',
            refundType: 'https://schema.org/FullRefund',
          },
        },
        additionalProperty: [
          {
            '@type': 'PropertyValue',
            name: 'Metallo Base',
            value: '100% Argento Sterling 925 Nichel-Free (Standard REACH UE)',
          },
          {
            '@type': 'PropertyValue',
            name: 'Placcatura & Finitura',
            value: product.plating || 'Oro 18K 1.0 Micron / Rodio + E-Coating',
          },
          {
            '@type': 'PropertyValue',
            name: 'Pietra / Gemme',
            value:
              product.gemstone ||
              'Moissanite Certificata GRA VVS1 D-Color / Perle',
          },
          {
            '@type': 'PropertyValue',
            name: 'Incisione di Garanzia',
            value: 'Punzone Legale S925 + Iniziali Laser IP (Isabel Pepe)',
          },
          {
            '@type': 'PropertyValue',
            name: 'Packaging',
            value:
              'Cofanetto Luxury Rigido, Panno Microfibra e Certificato di Autenticità Inclusi',
          },
          {
            '@type': 'PropertyValue',
            name: 'Impegno Etico',
            value:
              "5% dell'importo devoluto ai volontari per la tutela degli animali",
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalProductUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: product.category || 'Collezioni',
            item: `${BASE_URL}/shop?category=${encodeURIComponent(product.category || '')}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: canonicalProductUrl,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonicalProductUrl}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: "I gioielli Isabel Pepe possono andare a contatto con l'acqua o anneriscono col tempo?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Tutti i gioielli Isabel Pepe sono realizzati in puro Argento Sterling 925 anallergico protetto da un doppio scudo: placcatura in Oro 18K ad alto spessore (1.0 Micron, fino a 20 volte superiore alla bigiotteria) o Rodio puro a specchio, e sigillo finale molecolare E-Coating. Questa combinazione assicura resistenza quotidiana all'acqua, al sudore e previene l'ossidazione dell'argento.",
            },
          },
          {
            '@type': 'Question',
            name: 'Cosa è incluso nella confezione regalo Isabel Pepe?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Ogni ordine include la confezione luxury completa senza costi aggiuntivi: l\'elegante cofanetto rigido con apertura a scrigno, il panno speciale in microfibra per la lucidatura quotidiana e il Certificato Ufficiale di Autenticità e Garanzia nominale Isabel Pepe (con card e report GRA per le creazioni in Moissanite).',
            },
          },
          {
            '@type': 'Question',
            name: 'Quali sono i tempi di spedizione e la politica di reso?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Offriamo spedizione express gratuita in tutta Italia (24-48 ore lavorative) con corriere Poste Italiane / SDA e codice di tracciamento in tempo reale. Puoi usufruire del reso gratuito entro 14 giorni dalla consegna con rimborso integrale garantito.',
            },
          },
          {
            '@type': 'Question',
            name: 'Come funziona la donazione del 5% per la salvaguardia degli animali?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Per ogni creazione acquistata, Isabel Pepe devolve direttamente il 5% del ricavato a volontari indipendenti e rifugi sul territorio italiano impegnati quotidianamente nel salvataggio, cura e accudimento di animali in difficoltà.',
            },
          },
        ],
      },
    ],
  };
}

export function getBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

export function getFaqPageSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
