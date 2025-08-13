const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const mysql = require('./db/mysqlClient');
const mongo = require('./db/mongoClient');

async function run() {
  const jsonPath = path.join(__dirname, '..', 'data', 'data.json');
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const parsed = JSON.parse(raw);
  const products = parsed.products || [];
  console.log(`Seeding ${products.length} products into MySQL and MongoDB...`);

  // MySQL: upsert by id
  for (const p of products) {
    await mysql.product.upsert({
      where: { id: p.id },
      update: {
        title: p.title,
        description: p.description,
        category: p.category,
        price: p.price,
        discountPercentage: p.discountPercentage,
        rating: p.rating,
        stock: p.stock,
        tags: p.tags,
        brand: p.brand || "Generic",
        sku: p.sku,
        weight: p.weight,
        dimensions: p.dimensions,
        warrantyInformation: p.warrantyInformation,
        shippingInformation: p.shippingInformation,
        availabilityStatus: p.availabilityStatus,
        reviews: p.reviews,
        returnPolicy: p.returnPolicy,
        minimumOrderQuantity: p.minimumOrderQuantity,
        meta: p.meta,
        images: p.images,
        thumbnail: p.thumbnail
      },
      create: {
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        price: p.price,
        discountPercentage: p.discountPercentage,
        rating: p.rating,
        stock: p.stock,
        tags: p.tags,
        brand: p.brand || "Generic",
        sku: p.sku,
        weight: p.weight,
        dimensions: p.dimensions,
        warrantyInformation: p.warrantyInformation,
        shippingInformation: p.shippingInformation,
        availabilityStatus: p.availabilityStatus,
        reviews: p.reviews,
        returnPolicy: p.returnPolicy,
        minimumOrderQuantity: p.minimumOrderQuantity,
        meta: p.meta,
        images: p.images,
        thumbnail: p.thumbnail
      }
    });
  }
  console.log('MySQL seeding complete.');

  // Mongo: upsert by productId
  for (const p of products) {
    await mongo.product.upsert({
      where: { productId: p.id },
      update: {
        title: p.title,
        description: p.description,
        category: p.category,
        price: p.price,
        discountPercentage: p.discountPercentage,
        rating: p.rating,
        stock: p.stock,
        tags: p.tags,
        brand: p.brand || "Generic",
        sku: p.sku,
        weight: p.weight,
        dimensions: p.dimensions,
        warrantyInformation: p.warrantyInformation,
        shippingInformation: p.shippingInformation,
        availabilityStatus: p.availabilityStatus,
        reviews: p.reviews,
        returnPolicy: p.returnPolicy,
        minimumOrderQuantity: p.minimumOrderQuantity,
        meta: p.meta,
        images: p.images,
        thumbnail: p.thumbnail
      },
      create: {
        productId: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        price: p.price,
        discountPercentage: p.discountPercentage,
        rating: p.rating,
        stock: p.stock,
        tags: p.tags,
        brand: p.brand || "Generic",
        sku: p.sku,
        weight: p.weight,
        dimensions: p.dimensions,
        warrantyInformation: p.warrantyInformation,
        shippingInformation: p.shippingInformation,
        availabilityStatus: p.availabilityStatus,
        reviews: p.reviews,
        returnPolicy: p.returnPolicy,
        minimumOrderQuantity: p.minimumOrderQuantity,
        meta: p.meta,
        images: p.images,
        thumbnail: p.thumbnail
      }
    });
  }
  console.log('MongoDB seeding complete.');

  await mysql.$disconnect();
  await mongo.$disconnect();
  console.log('Done.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
