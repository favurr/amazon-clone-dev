import 'dotenv/config'
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const userId = "KWOBFaFIRIEaLxVoH8bxmKP1jtontVyZ";
  console.log("🚀 Starting seed with user:", userId);

  // 1. Create Category
  const category = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      id: "cat_electronics_001",
      name: "Electronics",
      slug: "electronics",
      isActive: true,
    },
  });

  // 2. Create Product
  const product = await prisma.product.upsert({
    where: { slug: "seed-iphone-15" },
    update: {},
    create: {
      id: "prod_iphone_001",
      title: "iPhone 15 Pro",
      slug: "seed-iphone-15",
      description: "Seed data for dashboard testing",
      mainImageUrl: "https://via.placeholder.com/150",
      titlePrice: 999,
      categoryId: category.id,
    },
  });

  // 3. Create Address
  const addr = await prisma.address.upsert({
    where: { id: "addr_manual_001" },
    update: {},
    create: {
      id: "addr_manual_001",
      userId: userId,
      streetAddress: "123 Amazon Tech Way",
      city: "Lagos",
      state: "Lagos State",
      postalCode: "100001",
      country: "Nigeria",
      isDefault: true,
    },
  });

  // 4. Create Orders (Ensuring no decimals reach the client later)
  const orderData = [
    { id: "ord_day_1", amount: 15000, date: new Date(), ref: "ref_today_101" },
    { id: "ord_week_1", amount: 25000, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), ref: "ref_week_101" },
    { id: "ord_month_1", amount: 45000, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), ref: "ref_month_101" },
    { id: "ord_year_1", amount: 120000, date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), ref: "ref_year_101" },
  ];

  for (const o of orderData) {
    await prisma.order.upsert({
      where: { id: o.id },
      update: {},
      create: {
        id: o.id,
        userId: userId,
        addressId: addr.id,
        totalPrice: o.amount,
        status: "COMPLETED",
        tx_ref: o.ref,
        paymentStatus: "success",
        createdAt: o.date,
        updatedAt: o.date,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            price: o.amount,
          },
        },
      },
    });
  }

  console.log("✅ Seed finished successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });