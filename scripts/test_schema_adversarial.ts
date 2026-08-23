import {
  getOrganizationAndWebsiteSchema,
  getProductPageSchema,
  getBreadcrumbSchema,
  getFaqPageSchema,
  BASE_URL,
  ORG_ID,
  WEBSITE_ID,
  LOGO_URL,
  ProductSchemaInput,
} from '../lib/schema';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(suite: string, condition: boolean, name: string, details: string) {
  results.push({
    suite,
    name,
    passed: condition,
    details: condition ? `PASS: ${details}` : `FAIL: ${details}`,
  });
  if (!condition) {
    console.error(`❌ [FAIL] [${suite}] ${name}: ${details}`);
  } else {
    console.log(`✅ [PASS] [${suite}] ${name}: ${details}`);
  }
}

async function runSchemaTests() {
  console.log('================================================================');
  console.log('🚀 EMPIRICAL ADVERSARIAL TEST: Schema.org JSON-LD Validation');
  console.log('================================================================\n');

  // --- SUITE 1: Organization & WebSite Schema ---
  const orgWebsiteSchema = getOrganizationAndWebsiteSchema();
  const orgWebsiteJsonStr = JSON.stringify(orgWebsiteSchema);

  assert(
    'OrganizationWebSite',
    typeof orgWebsiteJsonStr === 'string' && orgWebsiteJsonStr.length > 0,
    'Valid JSON Stringify',
    `String length: ${orgWebsiteJsonStr.length}`
  );

  const parsedOrgWebsite = JSON.parse(orgWebsiteJsonStr);
  assert(
    'OrganizationWebSite',
    parsedOrgWebsite['@context'] === 'https://schema.org',
    '@context is https://schema.org',
    `Context: ${parsedOrgWebsite['@context']}`
  );

  assert(
    'OrganizationWebSite',
    Array.isArray(parsedOrgWebsite['@graph']) && parsedOrgWebsite['@graph'].length === 2,
    '@graph contains 2 root entities',
    `Count: ${parsedOrgWebsite['@graph']?.length}`
  );

  const orgEntity = parsedOrgWebsite['@graph'].find((e: any) =>
    Array.isArray(e['@type']) ? e['@type'].includes('Organization') : e['@type'] === 'Organization'
  );
  const webEntity = parsedOrgWebsite['@graph'].find((e: any) => e['@type'] === 'WebSite');

  // Organization validation
  assert('OrganizationWebSite', !!orgEntity, 'Organization entity exists in @graph', 'Found Organization');
  if (orgEntity) {
    assert(
      'OrganizationWebSite',
      orgEntity['@id'] === ORG_ID,
      'Organization @id matches',
      orgEntity['@id']
    );
    assert(
      'OrganizationWebSite',
      orgEntity.name === 'Isabel Pepe',
      'Organization name matches',
      orgEntity.name
    );
    assert(
      'OrganizationWebSite',
      orgEntity.legalName === 'Creativia Digital Studio di Mario Pepe',
      'Organization legalName matches',
      orgEntity.legalName
    );
    assert(
      'OrganizationWebSite',
      orgEntity.logo && orgEntity.logo['@type'] === 'ImageObject' && orgEntity.logo.url === LOGO_URL,
      'Organization logo ImageObject is valid',
      JSON.stringify(orgEntity.logo)
    );
    assert(
      'OrganizationWebSite',
      orgEntity.address &&
        orgEntity.address['@type'] === 'PostalAddress' &&
        orgEntity.address.addressLocality === 'Salerno' &&
        orgEntity.address.addressCountry === 'IT',
      'Organization PostalAddress is valid',
      JSON.stringify(orgEntity.address)
    );
    assert(
      'OrganizationWebSite',
      Array.isArray(orgEntity.founder) &&
        orgEntity.founder.length === 2 &&
        orgEntity.founder.some((f: any) => f.name === 'Elena') &&
        orgEntity.founder.some((f: any) => f.name === 'Mario Pepe'),
      'Founders listed correctly (Elena & Mario Pepe)',
      JSON.stringify(orgEntity.founder)
    );
    assert(
      'OrganizationWebSite',
      Array.isArray(orgEntity.sameAs) && orgEntity.sameAs.length >= 3,
      'Social profiles in sameAs array',
      JSON.stringify(orgEntity.sameAs)
    );
    assert(
      'OrganizationWebSite',
      orgEntity.hasMerchantReturnPolicy &&
        orgEntity.hasMerchantReturnPolicy['@type'] === 'MerchantReturnPolicy' &&
        orgEntity.hasMerchantReturnPolicy.merchantReturnDays === 14,
      'MerchantReturnPolicy defined with 14 days',
      JSON.stringify(orgEntity.hasMerchantReturnPolicy)
    );
  }

  // WebSite validation
  assert('OrganizationWebSite', !!webEntity, 'WebSite entity exists in @graph', 'Found WebSite');
  if (webEntity) {
    assert('OrganizationWebSite', webEntity['@id'] === WEBSITE_ID, 'WebSite @id matches', webEntity['@id']);
    assert('OrganizationWebSite', webEntity.url === BASE_URL, 'WebSite url matches', webEntity.url);
    assert(
      'OrganizationWebSite',
      webEntity.potentialAction &&
        webEntity.potentialAction['@type'] === 'SearchAction' &&
        webEntity.potentialAction.target &&
        webEntity.potentialAction['query-input'] === 'required name=search_term_string',
      'SearchAction correctly defined',
      JSON.stringify(webEntity.potentialAction)
    );
  }

  // --- SUITE 2: Product Page Schema Adversarial Matrix ---
  const testProducts: { label: string; input: ProductSchemaInput; gallery: string[] }[] = [
    {
      label: 'Standard Active Product with Discount',
      input: {
        name: 'Anello Solitaire Étoile Oro 18K',
        slug: 'anello-solitaire-etoile-oro-18k',
        sku: 'IP-AN-001',
        description: 'Anello solitario in Argento 925 con placcatura Oro 18K e Moissanite GRA.',
        seo_description: 'Anello Solitaire Étoile: splendore puro con Moissanite GRA VVS1 D-Color.',
        price: 180,
        discount_price: 144,
        category: 'Anelli',
        materials: 'Argento Sterling 925',
        plating: 'Oro 18K 1.0µm',
        gemstone: 'Moissanite 1.0ct GRA',
        is_active: true,
        image_primary: 'https://cdn.isabelpepe.com/products/anello-1.jpg',
      },
      gallery: [
        'https://cdn.isabelpepe.com/products/anello-1.jpg',
        'https://cdn.isabelpepe.com/products/anello-2.jpg',
      ],
    },
    {
      label: 'Minimal Product Without Discount & Empty Gallery',
      input: {
        name: 'Punto Luce Mini',
        slug: 'punto-luce-mini',
        price: 89,
        discount_price: null,
        is_active: true,
        image_primary: 'https://cdn.isabelpepe.com/products/punto-luce.jpg',
      },
      gallery: [],
    },
    {
      label: 'Inactive / Out of Stock Product',
      input: {
        name: 'Collana Regina Barocca',
        slug: 'collana-regina-barocca',
        sku: 'IP-COL-099',
        price: 240,
        discount_price: 0,
        is_active: false,
      },
      gallery: ['https://cdn.isabelpepe.com/products/regina.jpg'],
    },
    {
      label: 'Adversarial Discount Greater Than Price',
      input: {
        name: 'Bracciale Tennis Luce',
        slug: 'bracciale-tennis-luce',
        price: 120,
        discount_price: 150, // invalid discount, should fallback to normal price 120
        is_active: true,
      },
      gallery: [],
    },
    {
      label: 'Adversarial Strings With Quotes, Ampersands & Special Chars',
      input: {
        name: 'Parure "L\'Élégance" & Amour <Special>',
        slug: 'parure-elegance-amour',
        description: 'Design "esclusivo" con simboli & perle d\'or',
        price: 299.99,
        category: "Set & Parure d'Élite",
        is_active: true,
      },
      gallery: ['https://cdn.isabelpepe.com/products/parure.jpg'],
    },
  ];

  for (const tc of testProducts) {
    const schema = getProductPageSchema(tc.input, tc.gallery);
    const jsonStr = JSON.stringify(schema);

    assert(
      'ProductSchema',
      typeof jsonStr === 'string' && jsonStr.length > 0,
      `[${tc.label}] Valid JSON serialization`,
      `Length: ${jsonStr.length}`
    );

    const parsed = JSON.parse(jsonStr);
    assert(
      'ProductSchema',
      parsed['@context'] === 'https://schema.org',
      `[${tc.label}] @context is https://schema.org`,
      parsed['@context']
    );

    assert(
      'ProductSchema',
      Array.isArray(parsed['@graph']) && parsed['@graph'].length === 3,
      `[${tc.label}] @graph contains 3 elements (Product, BreadcrumbList, FAQPage)`,
      `Entities: ${parsed['@graph']?.map((e: any) => e['@type']).join(', ')}`
    );

    const prod = parsed['@graph'].find((e: any) => e['@type'] === 'Product');
    const breadcrumb = parsed['@graph'].find((e: any) => e['@type'] === 'BreadcrumbList');
    const faq = parsed['@graph'].find((e: any) => e['@type'] === 'FAQPage');

    // Product Entity validation
    assert('ProductSchema', !!prod, `[${tc.label}] Product entity exists`, 'Found Product');
    if (prod) {
      assert(
        'ProductSchema',
        prod['@id'] === `${BASE_URL}/prodotto/${tc.input.slug}#product`,
        `[${tc.label}] Product @id format`,
        prod['@id']
      );
      assert('ProductSchema', prod.name === tc.input.name, `[${tc.label}] Product name matches`, prod.name);
      assert(
        'ProductSchema',
        Array.isArray(prod.image) && (prod.image.length > 0 || !tc.input.image_primary),
        `[${tc.label}] Product images is array`,
        `Count: ${prod.image?.length}`
      );
      assert(
        'ProductSchema',
        prod.brand && prod.brand['@type'] === 'Brand' && prod.brand.name === 'Isabel Pepe',
        `[${tc.label}] Product brand matches`,
        JSON.stringify(prod.brand)
      );

      // Offer validation
      const offer = prod.offers;
      assert('ProductSchema', !!offer, `[${tc.label}] Offer object exists`, 'Found offer');
      if (offer) {
        assert(
          'ProductSchema',
          offer['@type'] === 'Offer',
          `[${tc.label}] Offer @type is Offer`,
          offer['@type']
        );
        assert(
          'ProductSchema',
          offer.priceCurrency === 'EUR',
          `[${tc.label}] Offer priceCurrency is EUR`,
          offer.priceCurrency
        );

        // Price check
        const expectedPrice =
          tc.input.discount_price &&
          tc.input.discount_price > 0 &&
          tc.input.discount_price < tc.input.price
            ? tc.input.discount_price
            : tc.input.price;
        assert(
          'ProductSchema',
          offer.price === expectedPrice.toFixed(2),
          `[${tc.label}] Offer price correctly computed with 2 decimals`,
          `Expected ${expectedPrice.toFixed(2)}, got ${offer.price}`
        );

        // Availability check
        const expectedAvail =
          tc.input.is_active !== false
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock';
        assert(
          'ProductSchema',
          offer.availability === expectedAvail,
          `[${tc.label}] Availability check`,
          `Expected ${expectedAvail}, got ${offer.availability}`
        );

        // Shipping & Return Policy checks
        assert(
          'ProductSchema',
          offer.shippingDetails &&
            offer.shippingDetails['@type'] === 'OfferShippingDetails' &&
            offer.shippingDetails.shippingDestination?.addressCountry === 'IT',
          `[${tc.label}] OfferShippingDetails is valid`,
          JSON.stringify(offer.shippingDetails.deliveryTime)
        );

        assert(
          'ProductSchema',
          offer.hasMerchantReturnPolicy &&
            offer.hasMerchantReturnPolicy['@type'] === 'MerchantReturnPolicy' &&
            offer.hasMerchantReturnPolicy.merchantReturnDays === 14,
          `[${tc.label}] Offer MerchantReturnPolicy is valid`,
          JSON.stringify(offer.hasMerchantReturnPolicy.returnFees)
        );
      }

      // Additional properties check
      assert(
        'ProductSchema',
        Array.isArray(prod.additionalProperty) && prod.additionalProperty.length >= 5,
        `[${tc.label}] AdditionalProperty contains required luxury specs`,
        `Count: ${prod.additionalProperty?.length}`
      );
    }

    // Breadcrumb validation
    assert('ProductSchema', !!breadcrumb, `[${tc.label}] BreadcrumbList exists`, 'Found BreadcrumbList');
    if (breadcrumb) {
      assert(
        'ProductSchema',
        Array.isArray(breadcrumb.itemListElement) && breadcrumb.itemListElement.length === 3,
        `[${tc.label}] BreadcrumbList contains 3 levels (Home, Category, Product)`,
        `Count: ${breadcrumb.itemListElement?.length}`
      );
      assert(
        'ProductSchema',
        breadcrumb.itemListElement[0].position === 1 &&
          breadcrumb.itemListElement[1].position === 2 &&
          breadcrumb.itemListElement[2].position === 3,
        `[${tc.label}] Breadcrumb positions 1, 2, 3`,
        'Positions correct'
      );
    }

    // FAQPage validation
    assert('ProductSchema', !!faq, `[${tc.label}] FAQPage exists`, 'Found FAQPage');
    if (faq) {
      assert(
        'ProductSchema',
        Array.isArray(faq.mainEntity) && faq.mainEntity.length === 4,
        `[${tc.label}] FAQPage contains 4 Question items`,
        `Count: ${faq.mainEntity?.length}`
      );
      for (let i = 0; i < (faq.mainEntity?.length || 0); i++) {
        const q = faq.mainEntity[i];
        assert(
          'ProductSchema',
          q['@type'] === 'Question' &&
            typeof q.name === 'string' &&
            q.name.length > 5 &&
            q.acceptedAnswer &&
            q.acceptedAnswer['@type'] === 'Answer' &&
            typeof q.acceptedAnswer.text === 'string' &&
            q.acceptedAnswer.text.length > 20,
          `[${tc.label}] FAQ #${i + 1} Question/Answer structure`,
          `Q: ${q.name.substring(0, 30)}...`
        );
      }
    }
  }

  // --- SUITE 3: Standalone Helper Schemas ---
  const breadcrumbHelper = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Regali Anniversario', url: '/regali/anniversario' },
  ]);
  assert(
    'HelperSchemas',
    breadcrumbHelper['@type'] === 'BreadcrumbList' &&
      breadcrumbHelper.itemListElement[0].item === `${BASE_URL}/` &&
      breadcrumbHelper.itemListElement[1].item === `${BASE_URL}/regali/anniversario`,
    'getBreadcrumbSchema relative URLs automatically resolved to BASE_URL',
    JSON.stringify(breadcrumbHelper.itemListElement)
  );

  const faqHelper = getFaqPageSchema([
    { question: 'Quanto costa la spedizione?', answer: 'La spedizione express è gratuita in 24-48h.' },
  ]);
  assert(
    'HelperSchemas',
    faqHelper['@type'] === 'FAQPage' &&
      faqHelper.mainEntity.length === 1 &&
      faqHelper.mainEntity[0].name === 'Quanto costa la spedizione?',
    'getFaqPageSchema outputs valid FAQPage',
    JSON.stringify(faqHelper.mainEntity[0])
  );

  // --- SUMMARY ---
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n================================================================');
  console.log(`SCHEMA TEST SUMMARY: ${passed}/${total} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSchemaTests().catch((err) => {
  console.error('Fatal schema test error:', err);
  process.exit(1);
});
