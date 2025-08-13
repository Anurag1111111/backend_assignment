const express = require('express');
const mysql = require('../db/mysqlClient');
const mongo = require('../db/mongoClient');
const { encryptJSONForSid } = require('../crypto/session');

const router = express.Router();

router.get('/', async (req, res) => {
  const source = (req.query.source || 'mysql').toLowerCase();
  const sid = req.cookies?.sid;
  if (!sid) return res.status(401).json({ error: 'No session. Call /api/handshake first.' });

  try {
    let products;
    if (source === 'mongo' || source === 'mongodb') {
      products = await mongo.product.findMany();
      // Map to same shape as MySQL (use productId as id for display)
      products = products.map(p => ({ ...p, id: p.productId }));
    } else {
      products = await mysql.product.findMany();
    }

    const payload = encryptJSONForSid(sid, { products });
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  const source = (req.query.source || 'mysql').toLowerCase();
  const sid = req.cookies?.sid;
  if (!sid) return res.status(401).json({ error: 'No session. Call /api/handshake first.' });
  const id = parseInt(req.params.id, 10);
  try {
    let product;
    if (source === 'mongo' || source === 'mongodb') {
      product = await mongo.product.findFirst({ where: { productId: id } });
      if (product) product.id = product.productId;
    } else {
      product = await mysql.product.findUnique({ where: { id } });
    }
    if (!product) return res.status(404).json({ error: 'Not found' });
    const payload = encryptJSONForSid(sid, { product });
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;
