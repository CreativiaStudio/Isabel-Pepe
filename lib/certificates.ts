/**
 * Centralized Certificate Classification Engine & Metadata
 * Isabel Pepe — Alta Gioielleria Demi-Fine
 */

export type CertificateType = 
  | 'moissanite_gold' 
  | 'moissanite_rhodium' 
  | 'pearl_gold' 
  | 'silver_crystals';

export interface CertificateTab {
  id: string;
  label: string;
  imageSrc: string;
  alt: string;
  badge?: string;
  description: string;
}

export interface ProductCertificateInfo {
  certificateType: CertificateType;
  certificateImage: string;
  hasGraTabs: boolean;
  badgeTitle: string;
  badgeSubtitle: string;
  modalTitle: string;
  modalCategory: string;
  tabs: CertificateTab[];
  features: Array<{ title: string; text: string }>;
}

export interface ProductInput {
  name?: string;
  gemstone?: string;
  materials?: string;
  plating?: string;
  description?: string;
  color?: string;
  sku?: string;
  category?: string;
}

/**
 * Deterministically classifies a product into one of the 4 Isabel Pepe certificate tiers:
 * 1. pearl_gold (PL-6, PL-15-BRACELET, PL-30, PL-40) -> Pearl & 18K Gold Certificate (2 tabs)
 * 2. moissanite_gold (10 items) -> GRA Moissanite + Oro 18K Certificate (4 tabs)
 * 3. moissanite_rhodium (26 items including ASB4054-PINK) -> GRA Moissanite + Rodio Certificate (4 tabs)
 * 4. silver_crystals (ASB3093 Cristalli Rosa, plain silver) -> Argento Sterling 925 Certificate (1 tab, NO GRA)
 */
export function getProductCertificateInfo(product: ProductInput = {}): ProductCertificateInfo {
  const name = (product.name || '').toLowerCase();
  const gemstone = (product.gemstone || '').toLowerCase();
  const materials = (product.materials || '').toLowerCase();
  const plating = (product.plating || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const color = (product.color || '').toLowerCase();
  const sku = (product.sku || '').toUpperCase();

  // Tier 1: Freshwater Pearls (Highest precedence)
  const isPearl = Boolean(
    gemstone.includes('perl') ||
    name.includes('perl') ||
    sku.startsWith('PL-') ||
    materials.includes('perl') ||
    plating.includes('perl')
  );

  if (isPearl) {
    return {
      certificateType: 'pearl_gold',
      certificateImage: '/Brand/certificato_perle_card_clean.webp',
      hasGraTabs: false,
      badgeTitle: "Garanzia Ufficiale di Qualità",
      badgeSubtitle: "Certificato Perle Naturali d'Acqua Dolce & Oro 18K",
      modalTitle: "Certificato Ufficiale Perle & Oro 18K",
      modalCategory: "Documento Ufficiale Isabel Pepe",
      tabs: [
        {
          id: 'card',
          label: '1. Certificato Ufficiale Perle',
          imageSrc: '/Brand/certificato_perle_card_clean.webp',
          alt: "Certificato di Autenticità Perle Naturali e Oro 18K",
          badge: "Perle & Oro 18K",
          description: "Certificato ufficiale nominale che attesta la naturalezza e coltivazione delle perle d'acqua dolce e la placcatura in Oro 18K (1.0 Micron)."
        },
        {
          id: 'flatlay',
          label: '2. Studio Flatlay & Packaging',
          imageSrc: '/Brand/certificato_perle_flatlay.webp',
          alt: "Studio Flatlay Cofanetto e Certificato Perle",
          badge: "Studio Set",
          description: "Presentazione editoriale del certificato di autenticità con cofanetto luxury e nastro in seta."
        }
      ],
      features: [
        {
          title: "Perle d'Acqua Dolce Coltivate",
          text: "Selezionate a mano per lucentezza organica, sfericità e purezza (100% naturali)."
        },
        {
          title: "Metallo Nobile Certificato",
          text: "Argento Sterling 925 Nichel-Free con punzone legale S925 e sigillo laser \"IP\"."
        },
        {
          title: "Placcatura Oro 18K & E-Coating",
          text: "Spessore luxury da 1.0 Micron (20x standard) con scudo molecolare protettivo anti-ossidazione."
        }
      ]
    };
  }

  // Tier 2 & 3: Moissanite Check
  const isExplicitNonMoissanite = gemstone.includes('cristall') || gemstone.includes('zircon');
  const isMoissanite = !isExplicitNonMoissanite && Boolean(
    gemstone.includes('moissanite') ||
    gemstone.includes('vvs1') ||
    gemstone.includes('d-color') ||
    name.includes('moissanite') ||
    desc.includes('moissanite')
  );

  // Gold Plating Check
  const isGold = Boolean(
    plating.includes('oro') ||
    plating.includes('18k') ||
    plating.includes('gold') ||
    plating.includes('giallo') ||
    materials.includes('oro') ||
    materials.includes('18k') ||
    materials.includes('gold') ||
    name.includes('oro') ||
    name.includes('gold') ||
    sku.includes('GOLD') ||
    color.includes('oro') ||
    color.includes('giallo') ||
    desc.includes('oro 18k') ||
    desc.includes('oro giallo')
  );

  if (isMoissanite) {
    if (isGold) {
      return {
        certificateType: 'moissanite_gold',
        certificateImage: '/Brand/certificato_moissanite_oro18k.webp',
        hasGraTabs: true,
        badgeTitle: "Doppia Certificazione Inclusa",
        badgeSubtitle: "Libretto Gemmologico GRA + Card di Garanzia & Certificato Oro 18K",
        modalTitle: "Certificato Ufficiale GRA & Garanzia Oro 18K",
        modalCategory: "Certificazione Gemmologica & Garanzia di Lusso",
        tabs: [
          {
            id: 'report',
            label: '1. Libretto GRA',
            imageSrc: '/Brand/gra_report_interno_privacy.webp',
            alt: "Moissanite Grading Report Ufficiale GRA",
            badge: "VVS1 D-Color",
            description: "Report gemmologico completo GRA con analisi di colore D, purezza VVS1, simmetria, proporzioni e taglio Excellent."
          },
          {
            id: 'card',
            label: '2. Card GRA',
            imageSrc: '/Brand/gra_card_privacy.webp',
            alt: "Card Rigida Magnetica di Garanzia GRA",
            badge: "Serial ID",
            description: "Card rigida con QR Code univoco e codice matricola per la registrazione e verifica online sul registro globale GRA."
          },
          {
            id: 'cover',
            label: '3. Copertina GRA',
            imageSrc: '/Brand/gra_libretto_esterno.webp',
            alt: "Copertina Ufficiale Documento GRA Moissanite",
            badge: "Original",
            description: "Custodia protettiva rigida originale Global Gemological Research Academy."
          },
          {
            id: 'brand',
            label: '4. Certificato Isabel Pepe Oro 18K',
            imageSrc: '/Brand/certificato_moissanite_oro18k.webp',
            alt: "Certificato di Autenticità Isabel Pepe Oro 18K",
            badge: "Oro 18K",
            description: "Attesta la fusione in 100% Argento Sterling 925 Nichel-Free, placcatura Oro 18K (1.0 Micron) e Nano-Sigillo E-Coating."
          }
        ],
        features: [
          {
            title: "1. Libretto Ufficiale GRA",
            text: "Moissanite Grading Report con Grado Colore D, Purezza VVS1 e Taglio Excellent."
          },
          {
            title: "2. Card Rigida di Garanzia GRA",
            text: "Tessera magnetica PVC con QR Code univoco per la registrazione e verifica online della gemma."
          },
          {
            title: "3. Certificato Ufficiale Isabel Pepe",
            text: "Attesta la fusione in 100% Argento 925 Nichel-Free, placcatura Oro 18K (1.0 Micron) e Nano-Sigillo E-Coating."
          }
        ]
      };
    } else {
      return {
        certificateType: 'moissanite_rhodium',
        certificateImage: '/Brand/certificato_moissanite_rodio.webp',
        hasGraTabs: true,
        badgeTitle: "Doppia Certificazione Inclusa",
        badgeSubtitle: "Libretto Gemmologico GRA + Card di Garanzia & Certificato Rodio",
        modalTitle: "Certificato Ufficiale GRA & Garanzia Rodio Puro",
        modalCategory: "Certificazione Gemmologica & Garanzia di Lusso",
        tabs: [
          {
            id: 'report',
            label: '1. Libretto GRA',
            imageSrc: '/Brand/gra_report_interno_privacy.webp',
            alt: "Moissanite Grading Report Ufficiale GRA",
            badge: "VVS1 D-Color",
            description: "Report gemmologico completo GRA con analisi di colore D, purezza VVS1, simmetria, proporzioni e taglio Excellent."
          },
          {
            id: 'card',
            label: '2. Card GRA',
            imageSrc: '/Brand/gra_card_privacy.webp',
            alt: "Card Rigida Magnetica di Garanzia GRA",
            badge: "Serial ID",
            description: "Card rigida con QR Code univoco e codice matricola per la registrazione e verifica online sul registro globale GRA."
          },
          {
            id: 'cover',
            label: '3. Copertina GRA',
            imageSrc: '/Brand/gra_libretto_esterno.webp',
            alt: "Copertina Ufficiale Documento GRA Moissanite",
            badge: "Original",
            description: "Custodia protettiva rigida originale Global Gemological Research Academy."
          },
          {
            id: 'brand',
            label: '4. Certificato Isabel Pepe Rodio',
            imageSrc: '/Brand/certificato_moissanite_rodio.webp',
            alt: "Certificato di Autenticità Isabel Pepe Rodio Puro",
            badge: "Rodio Puro",
            description: "Attesta la fusione in 100% Argento Sterling 925 Nichel-Free, finitura in Rodio Puro a Specchio e Nano-Sigillo E-Coating."
          }
        ],
        features: [
          {
            title: "1. Libretto Ufficiale GRA",
            text: "Moissanite Grading Report con Grado Colore D, Purezza VVS1 e Taglio Excellent."
          },
          {
            title: "2. Card Rigida di Garanzia GRA",
            text: "Tessera magnetica PVC con QR Code univoco per la registrazione e verifica online della gemma."
          },
          {
            title: "3. Certificato Ufficiale Isabel Pepe",
            text: "Attesta la fusione in 100% Argento 925 Nichel-Free, finitura in Rodio Puro a Specchio e Nano-Sigillo E-Coating."
          }
        ]
      };
    }
  }

  // Tier 4: Sterling Silver / Crystals / Noble Metals (e.g. ASB3093 Cristalli Rosa)
  return {
    certificateType: 'silver_crystals',
    certificateImage: '/Brand/certificato_argento925.webp',
    hasGraTabs: false,
    badgeTitle: "Garanzia Ufficiale di Qualità",
    badgeSubtitle: `Certificato di Autenticità & Metalli Nobili ${isGold ? 'Oro 18K' : 'Rodio Puro'}`,
    modalTitle: `Certificato di Autenticità — Argento Sterling 925`,
    modalCategory: "Documento Ufficiale Isabel Pepe",
    tabs: [
      {
        id: 'card',
        label: '1. Certificato Argento Sterling 925',
        imageSrc: '/Brand/certificato_argento925.webp',
        alt: "Certificato di Autenticità Argento Sterling 925",
        badge: "Argento S925",
        description: "Certificato ufficiale di autenticità per creazioni in Argento Sterling 925 e metalli nobili placcati con sigillo E-Coating."
      }
    ],
    features: [
      {
        title: "Argento Sterling 925",
        text: "100% anallergico e nichel-free, punzonato con marchio legale S925 e sigillo laser \"IP\"."
      },
      {
        title: "Doppio Scudo Protettivo",
        text: `Placcatura ${isGold ? 'Oro 18K (1.0 Micron)' : 'Rodio Puro a Specchio'} + Nano-Sigillo Molecolare E-Coating.`
      },
      ...(isExplicitNonMoissanite ? [
        {
          title: "Pietre di Pura Luce",
          text: "Cristalli ad altissima rifrazione con taglio brillante e sfaccettatura fine."
        }
      ] : [])
    ]
  };
}

/**
 * Returns preset certificate configurations for all 4 product families (used by guarantee explorer / generic modals)
 */
export const CERTIFICATE_PRESETS: Record<CertificateType, ProductCertificateInfo> = {
  moissanite_gold: getProductCertificateInfo({
    name: 'Creazione Moissanite & Oro 18K',
    gemstone: 'Moissanite Certificata GRA VVS1 D-Color',
    plating: 'Placcatura Oro 18K (1.0 Micron)',
    materials: 'Argento Sterling 925'
  }),
  moissanite_rhodium: getProductCertificateInfo({
    name: 'Creazione Moissanite & Rodio Puro',
    gemstone: 'Moissanite Certificata GRA VVS1 D-Color',
    plating: 'Finitura in Rodio Puro a Specchio',
    materials: 'Argento Sterling 925'
  }),
  pearl_gold: getProductCertificateInfo({
    name: 'Creazione Perle Naturali & Oro 18K',
    gemstone: "Perle Naturali d'Acqua Dolce Selezionate a Mano",
    plating: 'Placcatura Oro 18K (1.0 Micron)',
    materials: 'Argento Sterling 925'
  }),
  silver_crystals: getProductCertificateInfo({
    name: 'Creazione Argento Sterling 925 & Cristalli',
    gemstone: 'Cristalli di Luce Rosa ad Altissima Rifrazione',
    plating: 'Finitura in Rodio Puro a Specchio',
    materials: 'Argento Sterling 925'
  })
};
