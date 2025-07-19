const express = require('express');
const router = express.Router();
const db = require('../database');

// Home page
router.get('/', (req, res) => {
  db.query('SELECT * FROM categories LIMIT 3', (err, categories) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    db.query('SELECT * FROM products ORDER BY id DESC LIMIT 4', (err, newProducts) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
      }
      db.query('SELECT * FROM products ORDER BY RAND() LIMIT 4', (err, bestSellers) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
        }
        db.query('SELECT * FROM banners WHERE is_active = TRUE ORDER BY sort_order ASC', (err, banners) => {
          if (err) {
            console.error(err);
            banners = [];
          }
          res.render('index', { categories, newProducts, bestSellers, banners, activePage: 'home' });
        });
      });
    });
  });
});

// Catalog page
router.get('/catalog', (req, res) => {
  db.query('SELECT * FROM products', (err, products) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    db.query('SELECT * FROM categories', (err, categories) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
      }
      res.render('catalog', { products, categories, activePage: 'catalog' });
    });
  });
});

// Product detail page
router.get('/product/:id', (req, res) => {
  const productId = req.params.id;
  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, products) => {
    if (err || products.length === 0) {
      res.status(404).send('Product not found');
      return;
    }
    db.query('SELECT * FROM reviews WHERE product_id = ?', [productId], (err, reviews) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
      }
      res.render('product', { product: products[0], reviews });
    });
  });
});

// API for products filtering
router.get('/api/products', (req, res) => {
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (req.query.category && req.query.category.length > 0) {
    const categories = req.query.category.split(',');
    sql += ' AND category_id IN (?)';
    params.push(categories);
  }

  if (req.query.brand && req.query.brand.length > 0) {
    const brands = req.query.brand.split(',');
    sql += ' AND brand_id IN (?)';
    params.push(brands);
  }

  if (req.query.search) {
    sql += ' AND name LIKE ?';
    params.push(`%${req.query.search}%`);
  }

  if (req.query.price) {
    sql += ' AND price <= ?';
    params.push(req.query.price);
  }

  if (req.query.sort) {
    switch (req.query.sort) {
      case 'price_asc':
        sql += ' ORDER BY price ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY price DESC';
        break;
      case 'popularity':
        sql += ' ORDER BY name ASC';
        break;
      case 'newest':
        sql += ' ORDER BY id DESC';
        break;
    }
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.json(results);
  });
});

// Cart management
router.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  res.render('cart', { cart, total });
});

router.post('/cart/add', (req, res) => {
  const productId = parseInt(req.body.productId);
  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, results) => {
    if (err || results.length === 0) {
      return res.redirect('/catalog');
    }
    const product = results[0];
    const cart = req.session.cart = req.session.cart || [];
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: 1
      });
    }
    res.redirect('/catalog');
  });
});

router.post('/cart/remove', (req, res) => {
  const productId = parseInt(req.body.productId);
  let cart = req.session.cart || [];
  cart = cart.filter(item => item.id !== productId);
  req.session.cart = cart;
  res.redirect('/cart');
});

router.post('/cart/clear', (req, res) => {
  req.session.cart = [];
  res.redirect('/cart');
});

// Checkout and order placement
router.get('/checkout', (req, res) => {
  res.render('checkout');
});

router.post('/place-order', (req, res) => {
  const { name, email } = req.body;
  const cart = req.session.cart || [];
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const order = {
    customer_name: name,
    customer_email: email,
    total_price: total
  };

  db.query('INSERT INTO orders SET ?', order, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    const orderId = result.insertId;
    const orderItems = cart.map(item => [orderId, item.id, item.quantity, item.price]);
    db.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?', [orderItems], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
      }
      req.session.cart = [];
      res.redirect('/thank-you');
    });
  });
});

router.get('/thank-you', (req, res) => {
  res.render('thank-you');
});

// Static pages
router.get('/about', (req, res) => {
  res.render('about', { activePage: 'about' });
});

// Color system demo page
router.get('/color-demo', (req, res) => {
  res.render('color-demo');
});

router.get('/contact', (req, res) => {
  res.render('contact', { activePage: 'contact' });
});

module.exports = router; 