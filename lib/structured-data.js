/**
 * Structured Data (JSON-LD) generators for SEO
 * Used for rich snippets in Google Search Results
 */

const SITE_URL = 'https://www.rewamart.co.tz';
const SITE_NAME = 'RewaMart';

/**
 * Organization Schema - Used on homepage
 */
export function getOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        alternateName: 'RewaMart Tanzania',
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo.png`,
        description: "Tanzania's premier e-commerce and investment platform. Shop products, earn cashback, and invest for your future.",
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'TZ',
            addressRegion: 'Dar es Salaam',
            addressLocality: 'Kariakoo'
        },
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            availableLanguage: ['English', 'Swahili']
        },
        sameAs: [
            // Add your social media URLs here when available
            // 'https://www.facebook.com/rewamart',
            // 'https://twitter.com/rewamart',
            // 'https://www.instagram.com/rewamart'
        ]
    };
}

/**
 * Website Schema with Search Action
 */
export function getWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/shop?search={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        }
    };
}

/**
 * Product Schema - For individual products
 */
export function getProductSchema(product) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.image.startsWith('http') ? product.image : `${SITE_URL}${product.image}`,
        description: product.description || `${product.name} available at RewaMart`,
        brand: {
            '@type': 'Brand',
            name: product.vendor || SITE_NAME
        },
        offers: {
            '@type': 'Offer',
            url: `${SITE_URL}/shop`,
            priceCurrency: 'TZS',
            price: product.price,
            availability: 'https://schema.org/InStock',
            seller: {
                '@type': 'Organization',
                name: SITE_NAME
            }
        },
        aggregateRating: product.rating ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount || 1
        } : undefined
    };
}

/**
 * Breadcrumb Schema - For navigation hierarchy
 */
export function getBreadcrumbSchema(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${SITE_URL}${item.url}`
        }))
    };
}

/**
 * LocalBusiness Schema - For contact/location pages
 */
export function getLocalBusinessSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': SITE_URL,
        name: SITE_NAME,
        image: `${SITE_URL}/images/logo.png`,
        description: "Tanzania's premier e-commerce and investment platform",
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'TZ',
            addressRegion: 'Dar es Salaam',
            addressLocality: 'Kariakoo'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: -6.8160,
            longitude: 39.2803
        },
        url: SITE_URL,
        telephone: '+255-XXX-XXX-XXX', // Replace with actual phone
        priceRange: 'TZS',
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '08:00',
                closes: '18:00'
            }
        ]
    };
}

/**
 * Helper function to inject JSON-LD into page
 */
export function renderStructuredData(schema) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
