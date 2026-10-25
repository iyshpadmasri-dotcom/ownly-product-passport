const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateToINR() {
  console.log('🇮🇳 Safely migrating database monetary values and locations to Indian localization (INR)...');

  // 1. Update demo users with Indian locations
  await prisma.user.updateMany({
    where: { email: 'demo@ownly.app' },
    data: {
      location: 'Bengaluru, Karnataka',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    },
  });

  await prisma.user.updateMany({
    where: { email: 'alex@ownly.app' },
    data: {
      location: 'Mumbai, Maharashtra',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
    },
  });

  // 2. Fetch all products and migrate prices & details
  const products = await prisma.product.findMany({
    include: {
      documents: true,
      history: true,
      listings: {
        include: { inquiries: true },
      },
    },
  });

  for (const prod of products) {
    let inrPurchasePrice = prod.purchasePrice;
    let purchaseStore = prod.purchaseStore;
    let category = prod.category;

    if (prod.name.includes('iPhone')) {
      inrPurchasePrice = 134900;
      purchaseStore = 'Apple Store BKC, Mumbai';
      category = 'Smartphones & Accessories';
    } else if (prod.name.includes('Sony')) {
      inrPurchasePrice = 29990;
      purchaseStore = 'Croma, Indiranagar';
      category = 'Smartphones & Accessories';
    } else if (prod.name.includes('Aeron')) {
      inrPurchasePrice = 125000;
      purchaseStore = 'Design Within Reach / Herman Miller India';
      category = 'Furniture & Home Products';
    } else if (prod.name.includes('Barista') || prod.name.includes('Espresso')) {
      inrPurchasePrice = 84999;
      purchaseStore = 'Tata CLiQ Luxury';
      category = 'Washing Machines & Appliances';
    } else if (prod.name.includes('Sirrus') || prod.name.includes('Bike')) {
      inrPurchasePrice = 115000;
      purchaseStore = 'ProCycle, Indiranagar, Bengaluru';
      category = 'Bicycles & Electric Scooters';
    } else if (prod.name.includes('Patagonia') || prod.name.includes('Sweater')) {
      inrPurchasePrice = 24999;
      purchaseStore = 'REI / Outdoor Travel Gear India';
      category = 'Clothing & Footwear';
    } else if (prod.name.includes('Fujifilm')) {
      inrPurchasePrice = 149999;
      purchaseStore = 'Foto Express, Bengaluru';
      category = 'Televisions & Home Electronics';
    } else if (prod.purchasePrice && prod.purchasePrice < 5000) {
      // Safe fallback conversion for any other test items
      inrPurchasePrice = Math.round(prod.purchasePrice * 85);
      purchaseStore = 'Retail Store India';
    }

    await prisma.product.update({
      where: { id: prod.id },
      data: {
        purchasePrice: inrPurchasePrice,
        purchaseStore: purchaseStore || 'Official Retailer',
        category,
        lifecycleStatus: prod.listings.length > 0 ? 'LISTED_SALE' : 'OWNED',
      },
    });

    // Migrate listings
    for (const listing of prod.listings) {
      let inrListingPrice = listing.price;
      if (prod.name.includes('iPhone')) inrListingPrice = 89900;
      else if (prod.name.includes('Aeron')) inrListingPrice = 78000;
      else if (prod.name.includes('Sirrus')) inrListingPrice = 75000;
      else if (prod.name.includes('Patagonia')) inrListingPrice = 14500;
      else if (prod.name.includes('Fujifilm')) inrListingPrice = 135000;
      else if (listing.price && listing.price < 5000) inrListingPrice = Math.round(listing.price * 85);

      await prisma.marketplaceListing.update({
        where: { id: listing.id },
        data: {
          price: inrListingPrice,
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          location: 'Bengaluru, Karnataka',
        },
      });

      // Migrate buyer inquiries
      for (const inq of listing.inquiries) {
        let inrOffer = inq.offerPrice;
        if (inq.offerPrice && inq.offerPrice < 5000) {
          inrOffer = Math.round(inq.offerPrice * 85);
        }
        await prisma.buyerInquiry.update({
          where: { id: inq.id },
          data: {
            offerPrice: inrOffer,
          },
        });
      }
    }

    // Migrate history costs and evidence types
    for (const h of prod.history) {
      let inrCost = h.cost;
      let evidenceType = 'SELF_REPORTED';

      if (h.eventType === 'Purchase') {
        inrCost = inrPurchasePrice;
        evidenceType = 'DOCUMENT_SUPPORTED';
      } else if (h.cost && h.cost > 0 && h.cost < 1000) {
        inrCost = Math.round(h.cost * 85);
      }

      if (h.serviceProvider && h.serviceProvider.toLowerCase().includes('apple')) {
        evidenceType = 'DOCUMENT_SUPPORTED';
      }

      await prisma.productHistory.update({
        where: { id: h.id },
        data: {
          cost: inrCost,
          evidenceType,
          recordedBy: h.serviceProvider || 'Product Owner',
        },
      });
    }

    // Check if product has an initial ConditionReport (TrustCheck), create one if missing
    const existingCR = await prisma.conditionReport.findFirst({
      where: { productId: prod.id },
    });

    if (!existingCR) {
      let checklistObj = {};
      if (category.includes('Smartphone') || category.includes('Electronics')) {
        checklistObj = {
          screen: { label: 'Screen & Touch Display', status: 'Good', notes: 'No scratches, original display, responsive touch.' },
          battery: { label: 'Battery Health & Performance', status: 'Good', notes: 'Normal battery life, charges reliably.' },
          camera: { label: 'Camera & Flash', status: 'Good', notes: 'All lenses clean and autofocusing correctly.' },
          charging: { label: 'Charging Port & Speakers', status: 'Good', notes: 'Clean USB port, stereo sound clear.' },
          physical: { label: 'Body & Frame Condition', status: 'Good', notes: 'Light signs of everyday handling.' },
          repairs: { label: 'Previous Known Repairs', status: 'None', notes: 'No unauthorized repairs or part replacements.' },
        };
      } else if (category.includes('Bicycle') || category.includes('Vehicle')) {
        checklistObj = {
          frame: { label: 'Frame & Fork Integrity', status: 'Good', notes: 'No cracks, bends, or structural welds.' },
          brakes: { label: 'Braking System', status: 'Good', notes: 'Hydraulic disc brakes bled and responsive.' },
          drivetrain: { label: 'Gears & Chain', status: 'Good', notes: 'Smooth shifting across all cogs.' },
          tires: { label: 'Tires & Wheels', status: 'Good', notes: 'Good tread depth, true rims.' },
        };
      } else {
        checklistObj = {
          structural: { label: 'Structural Integrity', status: 'Good', notes: 'Sturdy, all mechanical joints functioning.' },
          cosmetic: { label: 'Cosmetic Condition', status: 'Good', notes: 'Minor expected wear from regular use.' },
          functionality: { label: 'Primary Functions', status: 'Good', notes: 'Operates as intended.' },
        };
      }

      await prisma.conditionReport.create({
        data: {
          productId: prod.id,
          overallCondition: 'Like New',
          checklist: JSON.stringify(checklistObj),
          notes: 'Pre-inspected condition report documenting physical condition and functional checks.',
          evidenceStatus: 'DOCUMENT_SUPPORTED',
        },
      });
    }
  }

  console.log('✅ Safely migrated all database records to Indian Rupees (₹) and created initial TrustCheck reports.');
}

migrateToINR()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
