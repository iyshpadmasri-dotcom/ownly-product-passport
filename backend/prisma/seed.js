const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Ownly database with realistic sample passports and listings...');

  // Clean existing records
  await prisma.buyerInquiry.deleteMany();
  await prisma.marketplaceListing.deleteMany();
  await prisma.productHistory.deleteMany();
  await prisma.productDocument.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // User 1: Primary Demo User
  const user1 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'demo@ownly.app',
      passwordHash,
      location: 'San Francisco, CA',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  });

  // User 2: Community Seller
  const user2 = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex@ownly.app',
      passwordHash,
      location: 'Austin, TX',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log('👤 Created demo users: demo@ownly.app, alex@ownly.app (password: password123)');

  // Product 1: iPhone 15 Pro Max
  const p1 = await prisma.product.create({
    data: {
      userId: user1.id,
      name: 'iPhone 15 Pro Max 256GB',
      brand: 'Apple',
      model: 'Natural Titanium',
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      purchaseDate: new Date('2024-10-15T10:00:00Z'),
      purchasePrice: 1199.00,
      warrantyExpiry: new Date('2026-10-15T23:59:59Z'),
      description: 'Purchased directly from Apple Store Union Square. Always kept in an official fine woven case with a tempered glass screen protector.',
    },
  });

  await prisma.productDocument.createMany({
    data: [
      {
        productId: p1.id,
        type: 'Purchase Bill',
        title: 'Apple Store Official Tax Invoice',
        fileName: 'apple_invoice_2024.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '142 KB',
        mimeType: 'application/pdf',
        isPublicForListing: true,
      },
      {
        productId: p1.id,
        type: 'Warranty',
        title: 'AppleCare+ Proof of Coverage (2-Year Plan)',
        fileName: 'applecare_plus_cert.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '88 KB',
        mimeType: 'application/pdf',
        isPublicForListing: true,
      },
      {
        productId: p1.id,
        type: 'User Manual',
        title: 'iPhone 15 Pro Quick Start & Regulatory Sheet',
        fileName: 'iphone15_pro_guide.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '1.2 MB',
        mimeType: 'application/pdf',
        isPublicForListing: false,
      },
    ],
  });

  await prisma.productHistory.createMany({
    data: [
      {
        productId: p1.id,
        eventType: 'Purchase',
        eventDate: new Date('2024-10-15'),
        title: 'Purchased at Apple Store Union Square',
        notes: 'Includes original USB-C braided cable and box.',
        cost: 1199.00,
        serviceProvider: 'Apple Store',
      },
      {
        productId: p1.id,
        eventType: 'Upgrade',
        eventDate: new Date('2024-10-16'),
        title: 'Installed Belkin UltraGlass 2 Screen Protector',
        notes: 'Applied using Apple Store precision alignment machine.',
        cost: 39.95,
        serviceProvider: 'Apple Store',
      },
      {
        productId: p1.id,
        eventType: 'Service',
        eventDate: new Date('2025-08-20'),
        title: 'Annual Battery & Hardware Diagnostic Check',
        notes: 'Battery health verified at 99%. All microphones, speakers and camera sensors functioning normally.',
        cost: 0,
        serviceProvider: 'Apple Genius Bar',
      },
    ],
  });

  // Listing for Product 1
  const listing1 = await prisma.marketplaceListing.create({
    data: {
      productId: p1.id,
      userId: user1.id,
      title: 'iPhone 15 Pro Max 256GB Natural Titanium (With AppleCare+)',
      description: 'Meticulously cared for iPhone 15 Pro Max. Includes box, braided USB-C cable, and active AppleCare+ coverage until October 2026. Complete digital passport records available.',
      price: 890.00,
      condition: 'Like New',
      location: 'San Francisco, CA',
      sharePurchaseDate: true,
      shareWarranty: true,
      shareHistory: true,
      shareDocuments: true,
      status: 'ACTIVE',
    },
  });

  // Sample inquiry on Listing 1
  await prisma.buyerInquiry.create({
    data: {
      listingId: listing1.id,
      buyerUserId: user2.id,
      buyerName: 'David Chen',
      buyerEmail: 'david.chen@example.com',
      buyerPhone: '+1 (415) 555-0192',
      message: 'Hi Sarah! Is the phone still available? I live in Mission Bay and can pick it up tomorrow afternoon. Would you accept $850?',
      offerPrice: 850.00,
      status: 'NEW',
    },
  });

  // Product 2: Sony WH-1000XM5
  const p2 = await prisma.product.create({
    data: {
      userId: user1.id,
      name: 'Sony WH-1000XM5 Wireless Headphones',
      brand: 'Sony',
      model: 'Silver / Grey',
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      purchaseDate: new Date('2024-05-10T14:00:00Z'),
      purchasePrice: 398.00,
      warrantyExpiry: new Date('2026-05-10T23:59:59Z'),
      description: 'Flagship noise-canceling headphones. Used mainly for home office video calls and reading sessions.',
    },
  });

  await prisma.productDocument.createMany({
    data: [
      {
        productId: p2.id,
        type: 'Purchase Bill',
        title: 'Best Buy Digital Receipt',
        fileName: 'bestbuy_xm5_receipt.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '95 KB',
        mimeType: 'application/pdf',
        isPublicForListing: false,
      },
      {
        productId: p2.id,
        type: 'Warranty',
        title: 'Sony 2-Year Manufacturer Extended Warranty',
        fileName: 'sony_warranty_card.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '210 KB',
        mimeType: 'application/pdf',
        isPublicForListing: false,
      },
    ],
  });

  await prisma.productHistory.createMany({
    data: [
      {
        productId: p2.id,
        eventType: 'Purchase',
        eventDate: new Date('2024-05-10'),
        title: 'Purchased from Best Buy',
        notes: 'Comes with magnetic travel case, 3.5mm audio jack, and airplane adapter.',
        cost: 398.00,
        serviceProvider: 'Best Buy',
      },
      {
        productId: p2.id,
        eventType: 'Upgrade',
        eventDate: new Date('2024-09-12'),
        title: 'Firmware v2.0.2 Update',
        notes: 'Enabled multi-point Bluetooth connection and LDAC audio streaming.',
        cost: 0,
      },
      {
        productId: p2.id,
        eventType: 'Inspection',
        eventDate: new Date('2025-04-18'),
        title: 'Earpad and headband leather care',
        notes: 'Cleaned with audio-grade leather wipe.',
        cost: 15.00,
      },
    ],
  });

  // Product 3: Herman Miller Aeron Chair
  const p3 = await prisma.product.create({
    data: {
      userId: user1.id,
      name: 'Aeron Ergonomic Office Chair',
      brand: 'Herman Miller',
      model: 'Size B - Fully Loaded (Mineral)',
      category: 'Furniture',
      imageUrl: 'https://images.unsplash.com/photo-1580481077195-c999335ff200?w=800&auto=format&fit=crop&q=80',
      purchaseDate: new Date('2023-01-20T11:00:00Z'),
      purchasePrice: 1495.00,
      warrantyExpiry: new Date('2035-01-20T23:59:59Z'), // 12-year warranty!
      description: 'PostureFit SL lumbar support, fully adjustable arms with mineral armpads, tilt limiter with forward seat angle.',
    },
  });

  await prisma.productDocument.create({
    data: {
      productId: p3.id,
      type: 'Warranty',
      title: 'Herman Miller 12-Year 3-Shift Warranty Certificate',
      fileName: 'herman_miller_12yr_warranty.pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '340 KB',
      mimeType: 'application/pdf',
      isPublicForListing: true,
    },
  });

  await prisma.productHistory.createMany({
    data: [
      {
        productId: p3.id,
        eventType: 'Purchase',
        eventDate: new Date('2023-01-20'),
        title: 'Delivered from Design Within Reach',
        notes: 'Fully assembled with standard hard floor casters.',
        cost: 1495.00,
        serviceProvider: 'Design Within Reach',
      },
      {
        productId: p3.id,
        eventType: 'Service',
        eventDate: new Date('2025-02-14'),
        title: 'Hydraulic Cylinder & Tilt Tension Inspection',
        notes: 'Checked tilt mechanism and greased cylinder per user manual recommendations.',
        cost: 0,
      },
    ],
  });

  // Listing for Product 3
  await prisma.marketplaceListing.create({
    data: {
      productId: p3.id,
      userId: user1.id,
      title: 'Herman Miller Aeron Size B (Mineral / Satin Aluminum) - 12yr Warranty',
      description: 'Exceptional condition Herman Miller Aeron. Mineral mesh and frame. Backed by Herman Miller 12-year warranty through 2035. Non-smoking, pet-free home.',
      price: 920.00,
      condition: 'Excellent',
      location: 'San Francisco, CA',
      sharePurchaseDate: true,
      shareWarranty: true,
      shareHistory: true,
      shareDocuments: true,
      status: 'ACTIVE',
    },
  });

  // Product 4: Breville Barista Touch Espresso Machine
  const p4 = await prisma.product.create({
    data: {
      userId: user1.id,
      name: 'Barista Touch Espresso Machine',
      brand: 'Breville',
      model: 'BES880BSS Brushed Stainless',
      category: 'Appliances',
      imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
      purchaseDate: new Date('2023-11-25T16:00:00Z'),
      purchasePrice: 999.95,
      warrantyExpiry: new Date('2025-11-25T23:59:59Z'),
      description: 'Touchscreen bean-to-cup espresso machine with auto milk texturing and thermo-jet 3-second heat-up.',
    },
  });

  await prisma.productDocument.create({
    data: {
      productId: p4.id,
      type: 'Purchase Bill',
      title: 'Williams Sonoma Store Receipt',
      fileName: 'williams_sonoma_receipt.pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '180 KB',
      mimeType: 'application/pdf',
      isPublicForListing: false,
    },
  });

  await prisma.productHistory.createMany({
    data: [
      {
        productId: p4.id,
        eventType: 'Purchase',
        eventDate: new Date('2023-11-25'),
        title: 'Purchased at Williams Sonoma',
        cost: 999.95,
        serviceProvider: 'Williams Sonoma',
      },
      {
        productId: p4.id,
        eventType: 'Service',
        eventDate: new Date('2024-06-15'),
        title: 'Full descaling & group head silicone gasket replacement',
        notes: 'Caffiza tablet clean cycle run, steam wand purged.',
        cost: 24.50,
      },
      {
        productId: p4.id,
        eventType: 'Service',
        eventDate: new Date('2025-01-10'),
        title: 'Water filter cartridge replacement',
        notes: 'ClaroSwiss water filter replaced.',
        cost: 18.00,
      },
    ],
  });

  // Product 5: Gravel Bike (owned by Alex Rivera, listed on Marketplace)
  const p5 = await prisma.product.create({
    data: {
      userId: user2.id,
      name: 'Sirrus X 4.0 Gravel & Commuter Bike',
      brand: 'Specialized',
      model: 'Gloss Smoke / Black reflective (Medium)',
      category: 'Vehicles',
      imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80',
      purchaseDate: new Date('2024-04-12T09:00:00Z'),
      purchasePrice: 1600.00,
      warrantyExpiry: new Date('2026-04-12T23:59:59Z'),
      description: 'Future Shock 1.5 headset suspension, Shimano Deore 1x11 drivetrain, and Pathfinder Sport 38mm tires. Ridden fewer than 250 miles.',
    },
  });

  await prisma.productDocument.createMany({
    data: [
      {
        productId: p5.id,
        type: 'Purchase Bill',
        title: 'Mellow Johnny’s Bike Shop Sales Order',
        fileName: 'bike_shop_order.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '115 KB',
        mimeType: 'application/pdf',
        isPublicForListing: true,
      },
      {
        productId: p5.id,
        type: 'Service Records',
        title: 'Level 2 Tune-Up & Hydraulic Brake Bleed Invoice',
        fileName: 'tuneup_invoice_2025.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '75 KB',
        mimeType: 'application/pdf',
        isPublicForListing: true,
      },
    ],
  });

  await prisma.productHistory.createMany({
    data: [
      {
        productId: p5.id,
        eventType: 'Purchase',
        eventDate: new Date('2024-04-12'),
        title: 'Purchased from Mellow Johnny’s Bike Shop',
        cost: 1600.00,
        serviceProvider: 'Mellow Johnny’s',
      },
      {
        productId: p5.id,
        eventType: 'Service',
        eventDate: new Date('2024-11-05'),
        title: 'Initial 500km checkup and chain wax treatment',
        notes: 'Spoke tension verified, derailleur re-indexed.',
        cost: 65.00,
        serviceProvider: 'Austin Bike Works',
      },
      {
        productId: p5.id,
        eventType: 'Upgrade',
        eventDate: new Date('2025-03-01'),
        title: 'Installed Crankbrothers Stamp 1 pedals',
        notes: 'Composite flat pedals installed with anti-seize grease.',
        cost: 49.99,
      },
    ],
  });

  // Listing for Product 5
  await prisma.marketplaceListing.create({
    data: {
      productId: p5.id,
      userId: user2.id,
      title: 'Specialized Sirrus X 4.0 (Medium) - Like New with Service History',
      description: 'Excellent all-road gravel bike. Under 250 dry-weather miles. Verified tune-up record and proof of purchase included in passport. Ready for Austin greenbelt or commuting.',
      price: 1100.00,
      condition: 'Like New',
      location: 'Austin, TX',
      sharePurchaseDate: true,
      shareWarranty: true,
      shareHistory: true,
      shareDocuments: true,
      status: 'ACTIVE',
    },
  });

  // Product 6: Patagonia Down Sweater Jacket (Clothing category)
  const p6 = await prisma.product.create({
    data: {
      userId: user2.id,
      name: 'Down Sweater Hoody (Navy Blue, Size L)',
      brand: 'Patagonia',
      model: '800-fill NetPlus Down',
      category: 'Clothing',
      imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&auto=format&fit=crop&q=80',
      purchaseDate: new Date('2024-11-20T12:00:00Z'),
      purchasePrice: 329.00,
      warrantyExpiry: new Date('2034-11-20T23:59:59Z'), // Patagonia Ironclad Guarantee
      description: 'Worn only 3 times during a ski trip. Stored uncompressed in climate-controlled closet.',
    },
  });

  await prisma.productHistory.create({
    data: {
      productId: p6.id,
      eventType: 'Purchase',
      eventDate: new Date('2024-11-20'),
      title: 'Purchased from REI Austin',
      cost: 329.00,
      serviceProvider: 'REI',
    },
  });

  await prisma.marketplaceListing.create({
    data: {
      productId: p6.id,
      userId: user2.id,
      title: 'Patagonia Down Sweater Hoody - Size L (Like New)',
      description: 'Practically brand new Patagonia down jacket. Backed by Patagonia lifetime Ironclad Guarantee. Freshly laundered with Nikwax Down Wash.',
      price: 185.00,
      condition: 'Like New',
      location: 'Austin, TX',
      sharePurchaseDate: true,
      shareWarranty: true,
      shareHistory: true,
      shareDocuments: false,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Seed completed successfully with 6 rich product passports and 4 active marketplace listings!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
