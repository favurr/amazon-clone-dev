import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create Categories
  const electronics = await prisma.category.upsert({
    where: { name: "Electronics" },
    update: {},
    create: { name: "Electronics" },
  });

  const fashion = await prisma.category.upsert({
    where: { name: "Fashion" },
    update: {},
    create: { name: "Fashion" },
  });

  // 2. Create a Test User (for reviews and orders)
  const testUser = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      firstName: "John",
      lastName: "Doe",
      name: "John Doe",
    },
  });

  // 3. Create Products with nested Variants and Images
  const products = [
    {
      title: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      description: "Titanium design and A17 Pro chip.",
      price: 999.99,
      categoryId: electronics.id,
      variants: [
        { type: "Color", value: "Natural Titanium", stock: 10, sku: "IP15-NAT" },
        { type: "Storage", value: "256GB", stock: 5, sku: "IP15-256" },
      ],
    },
    {
      title: "Logitech G Pro Mouse",
      slug: "logitech-g-pro",
      description: "Wireless gaming mouse with HERO sensor.",
      price: 129.99,
      categoryId: electronics.id,
      variants: [
        { type: "Color", value: "Black", stock: 100, sku: "LOGI-BLK" },
        { type: "Color", value: "White", stock: 45, sku: "LOGI-WHT" },
      ],
    },
    {
      title: "Vintage Denim Jacket",
      slug: "denim-jacket",
      description: "Classic blue denim jacket with a relaxed fit.",
      price: 85.00,
      categoryId: fashion.id,
      variants: [
        { type: "Size", value: "Medium", stock: 12, sku: "DENIM-M" },
        { type: "Size", value: "Large", stock: 0, sku: "DENIM-L" }, // Test out of stock
      ],
    },
  ];

  for (const p of products) {
    const createdProduct = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        description: p.description,
        mainImageUrl: `https://images.unsplash.com/photo-example-${p.slug}`,
        titlePrice: p.price,
        categoryId: p.categoryId,
        variants: {
          create: p.variants,
        },
        // 4. Add a Review for each product
        reviews: {
          create: {
            rating: 5,
            comment: `This ${p.title} is amazing! Highly recommended.`,
            userId: testUser.id,
          },
        },
      },
    });
    console.log(`Created product: ${createdProduct.title}`);
  }

  console.log("✅ Seeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })