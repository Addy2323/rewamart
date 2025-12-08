const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSubcategories() {
    try {
        console.log('🔄 Updating product subcategories...\n');

        // Get all products
        const products = await prisma.product.findMany({
            include: { category: true }
        });

        console.log(`Found ${products.length} products\n`);

        let updated = 0;

        for (const product of products) {
            const productName = product.name.toLowerCase();
            const categoryName = product.category.name.toLowerCase();
            let subcategory = null;

            console.log(`Checking: "${product.name}" (Category: ${product.category.name})`);

            // Women's Clothing subcategories
            if (categoryName.includes('women') || categoryName.includes('fashion') || categoryName.includes('clothing')) {
                if (productName.includes('dress')) {
                    subcategory = 'dresses';
                } else if (productName.includes('top') || productName.includes('blouse') || productName.includes('shirt')) {
                    subcategory = 'tops';
                } else if (productName.includes('suit') || productName.includes('blazer') || productName.includes('jacket')) {
                    subcategory = 'womens suits';
                } else if (productName.includes('pant') || productName.includes('jean') || productName.includes('skirt') || productName.includes('trouser') || productName.includes('bottom')) {
                    subcategory = 'bottom';
                } else {
                    // Default for women's clothing if no specific match
                    subcategory = 'dresses';
                }
            }

            // Men's Clothing subcategories
            if ((categoryName.includes('men') && !categoryName.includes('women')) || categoryName.includes('male')) {
                if (productName.includes('shirt') || productName.includes('tshirt') || productName.includes('polo') || productName.includes('top')) {
                    subcategory = 'shirts';
                } else if (productName.includes('pant') || productName.includes('jean') || productName.includes('trouser')) {
                    subcategory = 'pants';
                } else if (productName.includes('suit') || productName.includes('blazer') || productName.includes('jacket')) {
                    subcategory = 'suits';
                } else if (productName.includes('shoe') || productName.includes('sneaker') || productName.includes('boot')) {
                    subcategory = 'shoes';
                }
            }

            // Electronics subcategories
            if (categoryName.includes('electronic') || categoryName.includes('tech')) {
                if (productName.includes('phone') || productName.includes('mobile') || productName.includes('smartphone')) {
                    subcategory = 'phones';
                } else if (productName.includes('laptop') || productName.includes('computer') || productName.includes('pc')) {
                    subcategory = 'computers';
                } else if (productName.includes('tv') || productName.includes('television')) {
                    subcategory = 'televisions';
                } else if (productName.includes('headphone') || productName.includes('earphone') || productName.includes('speaker')) {
                    subcategory = 'audio';
                } else if (productName.includes('camera')) {
                    subcategory = 'cameras';
                }
            }

            // Home & Garden subcategories
            if (categoryName.includes('home') || categoryName.includes('garden')) {
                if (productName.includes('furniture') || productName.includes('chair') || productName.includes('table') || productName.includes('bed')) {
                    subcategory = 'furniture';
                } else if (productName.includes('kitchen') || productName.includes('cookware') || productName.includes('utensil')) {
                    subcategory = 'kitchen';
                } else if (productName.includes('decor') || productName.includes('decoration')) {
                    subcategory = 'decor';
                } else if (productName.includes('garden') || productName.includes('plant') || productName.includes('outdoor')) {
                    subcategory = 'garden';
                }
            }

            // Update the product if subcategory was determined
            if (subcategory) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: { subcategory }
                });
                console.log(`✅ Assigned subcategory: "${subcategory}"\n`);
                updated++;
            } else {
                console.log(`⚠️  No subcategory match found\n`);
            }
        }

        console.log(`\n✨ Updated ${updated} out of ${products.length} products!`);
    } catch (error) {
        console.error('❌ Error updating subcategories:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateSubcategories();
