/**
 * SEO Metadata generation utilities
 * Provides consistent metadata across all pages
 */

const SITE_URL = 'https://www.rewamart.co.tz';
const SITE_NAME = 'RewaMart';
const DEFAULT_DESCRIPTION = "Tanzania's premier e-commerce and investment platform. Shop quality products, earn cashback rewards, and invest for your future growth.";
const DEFAULT_KEYWORDS = 'online shopping Tanzania, e-commerce Tanzania, cashback shopping, investment platform, RewaMart, Dar es Salaam shopping, earn money shopping, referral rewards';

/**
 * Generate complete metadata for a page
 */
export function generateMetadata({
    title,
    description = DEFAULT_DESCRIPTION,
    keywords = DEFAULT_KEYWORDS,
    image = '/images/og-image.png',
    url = '',
    type = 'website',
    noindex = false,
    author = 'RewaMart',
}) {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Shop, Earn, Invest`;
    const fullUrl = `${SITE_URL}${url}`;
    const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

    return {
        title: fullTitle,
        description,
        keywords,
        authors: [{ name: author }],
        creator: SITE_NAME,
        publisher: SITE_NAME,
        metadataBase: new URL(SITE_URL),
        alternates: {
            canonical: fullUrl,
        },
        robots: noindex ? {
            index: false,
            follow: true,
        } : {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        openGraph: {
            type,
            locale: 'en_TZ',
            url: fullUrl,
            title: fullTitle,
            description,
            siteName: SITE_NAME,
            images: [
                {
                    url: fullImage,
                    width: 1200,
                    height: 630,
                    alt: `${SITE_NAME} - ${title || 'Shop, Earn, Invest'}`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [fullImage],
            creator: '@rewamart', // Update with actual Twitter handle
        },
        verification: {
            // Add verification codes when you set up tools
            // google: 'your-google-verification-code',
            // bing: 'your-bing-verification-code',
        },
    };
}

/**
 * Product-specific metadata
 */
export function generateProductMetadata(product) {
    return generateMetadata({
        title: product.name,
        description: product.description || `Buy ${product.name} at RewaMart. Price: TZS ${product.price.toLocaleString()}. Get ${product.cashback * 100}% cashback on this purchase.`,
        keywords: `${product.name}, ${product.category}, buy ${product.name} Tanzania, ${DEFAULT_KEYWORDS}`,
        image: product.image,
        url: `/shop?product=${product.id}`,
        type: 'product',
    });
}

/**
 * Category page metadata
 */
export function generateCategoryMetadata(category, description) {
    return generateMetadata({
        title: `${category} Products`,
        description: description || `Browse our collection of ${category.toLowerCase()} products. Shop quality items with cashback rewards.`,
        keywords: `${category} Tanzania, buy ${category} online, ${DEFAULT_KEYWORDS}`,
        url: `/shop?category=${category.toLowerCase()}`,
    });
}
