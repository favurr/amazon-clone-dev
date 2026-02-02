import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import slugify from "slugify";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const MIN_PRODUCTS = 20;
  const MAX_PRODUCTS = 30;

  const PRODUCT_NAMES: Record<string, string[]> = {
    electronics: [
      "Samsung Galaxy A15",
      "iPhone 13 Pro",
      "Infinix Hot 40",
      "Tecno Camon 20",
      "Oraimo FreePods Lite",
      "Sony WH-1000XM5 Headphones",
      "JBL Flip 6 Speaker",
      "Anker PowerCore 20000mAh",
      "Apple AirPods Pro (2nd Gen)",
      "Xiaomi Redmi Note 13",
      'LG 55" Smart OLED TV',
      'Samsung 32" Smart TV',
      "Hisense 2HP Split AC",
      "Canon EOS 2000D DSLR",
      "Nikon D3500 Camera",
      "GoPro Hero 11",
      "Apple Watch Series 9",
      "Samsung Galaxy Watch 6",
      "Amazon Fire TV Stick 4K",
      "Google Chromecast HD",
      "HP DeskJet 4155e Printer",
      "Logitech MX Master 3S Mouse",
      "Logitech K380 Keyboard",
      "Baseus USB-C Hub",
      "TP-Link Archer C6 Router",
      "Netgear Nighthawk Router",
      "Ring Video Doorbell",
      "Philips Hue Starter Kit",
      "Xiaomi Mi Smart Camera",
    ],

    computing: [
      "MacBook Air M2",
      "MacBook Pro 14-inch M3",
      "Dell XPS 13",
      "HP Pavilion 15",
      "Lenovo ThinkPad X1 Carbon",
      "Asus ZenBook 14",
      "Acer Aspire 5",
      "MSI Katana Gaming Laptop",
      "Surface Laptop 5",
      "HP EliteBook 840",
      "Apple Magic Keyboard",
      "Apple Magic Mouse",
      "Logitech MX Keys",
      "Keychron K6 Mechanical Keyboard",
      "Razer DeathAdder V2",
      'Samsung 27" 144Hz Monitor',
      'LG UltraWide 34" Monitor',
      'Dell 24" IPS Monitor',
      "WD 1TB External SSD",
      "Samsung T7 2TB SSD",
      "Seagate 4TB External HDD",
      "SanDisk 128GB Flash Drive",
      "Crucial 16GB DDR4 RAM",
      "Corsair Vengeance 32GB RAM",
      "Intel Core i7 13th Gen",
      "AMD Ryzen 7 5800X",
      "NVIDIA RTX 4070 GPU",
      "Corsair 750W PSU",
      "Cooler Master CPU Cooler",
    ],

    gaming: [
      "PlayStation 5 Console",
      "Xbox Series X",
      "Nintendo Switch OLED",
      "DualSense Wireless Controller",
      "Xbox Elite Controller Series 2",
      "Nintendo Pro Controller",
      "PlayStation VR2 Headset",
      "Oculus Quest 3",
      "Razer BlackShark V2 Headset",
      "SteelSeries Arctis 7",
      "Logitech G Pro X Headset",
      "Gaming Chair – Secretlab Titan",
      "Gaming Desk – Eureka Ergonomic",
      "Elgato Stream Deck",
      "Elgato HD60 X Capture Card",
      "PlayStation Portal Remote Player",
      "Nintendo Joy-Con Pair",
      "Thrustmaster Racing Wheel",
      "Logitech G29 Racing Wheel",
      "PS5 Charging Station",
      "Xbox Rechargeable Battery Pack",
      "Gaming Mouse – Logitech G502",
      "Gaming Keyboard – Razer Huntsman",
      "Gaming Monitor – ASUS TUF 165Hz",
      "Nintendo Switch Dock",
      "PS5 Media Remote",
      "Xbox Game Pass Ultimate Card",
      "Steam Deck 512GB",
      "ROG Ally Handheld",
    ],

    fashion: [
      "Nike Air Force 1",
      "Adidas Ultraboost",
      "New Balance 550",
      "Puma RS-X Sneakers",
      "Converse Chuck Taylor",
      "Levi’s 501 Original Jeans",
      "Slim Fit Chinos – Zara",
      "Oversized Hoodie – H&M",
      "Cotton Crewneck T-Shirt",
      "Graphic Tee – Uniqlo",
      "Formal Long Sleeve Shirt",
      "Ankara Two-Piece Outfit",
      "Traditional Agbada Set",
      "Casual Polo Shirt",
      "Denim Jacket",
      "Leather Bomber Jacket",
      "Wool Cardigan",
      "Summer Shorts",
      "Jogger Sweatpants",
      "Running Shorts – Nike",
      "Baseball Cap",
      "Beanie Hat",
      "Leather Belt",
      "Classic Wrist Watch",
      "Smart Casual Loafers",
      "Oxford Dress Shoes",
      "Sandals – Birkenstock",
      "Flip Flops",
      "Fashion Backpack",
    ],

    home: [
      "3-Seater Fabric Sofa",
      "Modern L-Shaped Sofa",
      "Wooden Coffee Table",
      "Glass Center Table",
      "Queen Size Bed Frame",
      "Orthopedic Mattress",
      "Bedside Drawer",
      "Wall Mounted Bookshelf",
      "TV Console Stand",
      "Dining Table (6 Seater)",
      "Office Desk",
      "Ergonomic Office Chair",
      "Standing Floor Lamp",
      "Decorative Wall Mirror",
      "Persian Area Rug",
      "Curtain Set – Blackout",
      "Throw Pillows (Set of 4)",
      "Wall Clock – Minimal",
      "Home Storage Cabinet",
      "Laundry Basket",
      "Shoe Rack",
      "Indoor Plant – Fiddle Leaf",
      "Artificial Plant Decor",
      "Photo Frame Set",
      "Wall Art Canvas",
      "Ceiling Fan",
      "Air Humidifier",
      "Dehumidifier",
      "Home Safe Box",
    ],

    kitchen: [
      "Non-Stick Frying Pan",
      "Stainless Steel Pot Set",
      "Electric Kettle – 1.7L",
      "Air Fryer – 5L",
      "Microwave Oven",
      "Gas Cooker – 4 Burner",
      "Blender – 600W",
      "Food Processor",
      "Toaster – 2 Slice",
      "Sandwich Maker",
      "Rice Cooker – 1.8L",
      "Pressure Cooker",
      "Knife Set – Stainless",
      "Cutting Board Set",
      "Dish Rack",
      "Water Dispenser",
      "Coffee Maker",
      "Espresso Machine",
      "Electric Juicer",
      "Measuring Cup Set",
      "Cooking Utensil Set",
      "Thermal Flask",
      "Kitchen Storage Containers",
      "Spice Rack Organizer",
      "Baking Tray Set",
      "Hand Mixer",
      "Electric Grill",
      "Deep Fryer",
      "Slow Cooker",
    ],
  };

  function randomBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomPriceByCategory(slug: string) {
    switch (slug) {
      case "electronics":
      case "computing":
        return randomBetween(150_000, 2_500_000);
      case "gaming":
        return randomBetween(200_000, 3_000_000);
      case "fashion":
        return randomBetween(10_000, 150_000);
      case "home":
      case "kitchen":
        return randomBetween(25_000, 800_000);
      default:
        return randomBetween(10_000, 100_000);
    }
  }

  function realisticDescription(name: string, category: string) {
    return `${name} is a high-quality ${category} product designed for durability, performance, and everyday use. Carefully selected for reliability and long-term value.`;
  }

  const categories = await prisma.category.findMany();

  for (const category of categories) {
    const names = PRODUCT_NAMES[category.slug];
    if (!names) continue;
    const count = randomBetween(MIN_PRODUCTS, MAX_PRODUCTS);

    const selected = names.sort(() => 0.5 - Math.random()).slice(0, count);

    for (const name of selected) {
      await prisma.product.upsert({
        where: { slug: slugify(`${category.slug}-${name}`) },
        update: {},
        create: {
          title: name,
          slug: slugify(`${category.slug}-${name}`, {
            lower: true,
            strict: true,
          }),
          mainImageUrl: "/main-example.jpg",
          titlePrice: randomPriceByCategory(category.slug),
          categoryId: category.id,
          description: realisticDescription(name, category.slug),
          images: {
            create: [
              { url: "/example.jpg", key: "seed-1", order: 0 },
              { url: "/example.jpg", key: "seed-2", order: 1 },
              { url: "/example.jpg", key: "seed-3", order: 2 },
            ],
          },
        },
      });
    }
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
