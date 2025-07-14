const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  db.query('SELECT * FROM categories LIMIT 3', (err, categories) => {
    if (err) throw err;
    db.query('SELECT * FROM products ORDER BY id DESC LIMIT 4', (err, newProducts) => {
      if (err) throw err;
      db.query('SELECT * FROM products ORDER BY RAND() LIMIT 4', (err, bestSellers) => {
        if (err) throw err;
        res.render('index', { categories, newProducts, bestSellers });
      });
    });
  });
});

// Product routes
app.get('/admin/products', (req, res) => {
  db.query('SELECT * FROM products', (err, products) => {
    if (err) throw err;
    res.render('admin/products', { products });
  });
});

app.get('/admin/products/add', (req, res) => {
  db.query('SELECT * FROM categories', (err, categories) => {
    if (err) throw err;
    res.render('admin/product-form', {
      title: 'Добавить товар',
      action: '/admin/products/add',
      submitText: 'Добавить',
      product: {},
      categories
    });
  });
});

app.post('/admin/products/add', (req, res) => {
  db.query('INSERT INTO products SET ?', req.body, (err) => {
    if (err) throw err;
    res.redirect('/admin/products');
  });
});

// Category routes
app.get('/admin/categories', (req, res) => {
  db.query('SELECT * FROM categories', (err, categories) => {
    if (err) throw err;
    res.render('admin/categories', { categories });
  });
});

app.get('/admin/categories/add', (req, res) => {
  res.render('admin/category-form', {
    title: 'Добавить категорию',
    action: '/admin/categories/add',
    submitText: 'Добавить',
    category: {}
  });
});

app.post('/admin/categories/add', (req, res) => {
  db.query('INSERT INTO categories SET ?', req.body, (err) => {
    if (err) throw err;
    res.redirect('/admin/categories');
  });
});

app.get('/admin/categories/edit/:id', (req, res) => {
  const categoryId = req.params.id;
  db.query('SELECT * FROM categories WHERE id = ?', [categoryId], (err, categories) => {
    if (err || categories.length === 0) {
      res.status(404).send('Category not found');
      return;
    }
    res.render('admin/category-form', {
      title: 'Редактировать категорию',
      action: `/admin/categories/edit/${categoryId}`,
      submitText: 'Сохранить',
      category: categories[0]
    });
  });
});

app.post('/admin/categories/edit/:id', (req, res) => {
  const categoryId = req.params.id;
  db.query('UPDATE categories SET ? WHERE id = ?', [req.body, categoryId], (err) => {
    if (err) throw err;
    res.redirect('/admin/categories');
  });
});

app.post('/admin/categories/delete/:id', (req, res) => {
  const categoryId = req.params.id;
  db.query('DELETE FROM categories WHERE id = ?', [categoryId], (err) => {
    if (err) throw err;
    res.redirect('/admin/categories');
  });
});

app.get('/admin/products/edit/:id', (req, res) => {
  const productId = req.params.id;
  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, products) => {
    if (err || products.length === 0) {
      res.status(404).send('Product not found');
      return;
    }
    db.query('SELECT * FROM categories', (err, categories) => {
      if (err) throw err;
      res.render('admin/product-form', {
        title: 'Редактировать товар',
        action: `/admin/products/edit/${productId}`,
        submitText: 'Сохранить',
        product: products[0],
        categories
      });
    });
  });
});

app.post('/admin/products/edit/:id', (req, res) => {
  const productId = req.params.id;
  db.query('UPDATE products SET ? WHERE id = ?', [req.body, productId], (err) => {
    if (err) throw err;
    res.redirect('/admin/products');
  });
});

app.post('/admin/products/delete/:id', (req, res) => {
  const productId = req.params.id;
  db.query('DELETE FROM products WHERE id = ?', [productId], (err) => {
    if (err) throw err;
    res.redirect('/admin/products');
  });
});

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const db = require('./database');

const upload = multer({ dest: 'uploads/' });

app.post('/admin/products/import', upload.single('csv'), (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(Object.values(data)))
    .on('end', () => {
      const sql = 'INSERT INTO products (name, description, price, category_id, image_url) VALUES ?';
      db.query(sql, [results], (err) => {
        if (err) throw err;
        fs.unlinkSync(req.file.path); // remove uploaded file
        res.redirect('/admin/products');
      });
    });
});

app.get('/api/products', (req, res) => {
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (req.query.category) {
    sql += ' AND category_id = ?';
    params.push(req.query.category);
  }

  if (req.query.search) {
    sql += ' AND name LIKE ?';
    params.push(`%${req.query.search}%`);
  }

  if (req.query.sort) {
    if (req.query.sort === 'price_asc') {
      sql += ' ORDER BY price ASC';
    } else if (req.query.sort === 'price_desc') {
      sql += ' ORDER BY price DESC';
    }
  }

  db.query(sql, params, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/catalog', (req, res) => {
  db.query('SELECT * FROM products', (err, products) => {
    if (err) throw err;
    db.query('SELECT * FROM categories', (err, categories) => {
      if (err) throw err;
      res.render('catalog', { products, categories });
    });
  });
});

app.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  res.render('cart', { cart, total });
});

app.post('/cart/add', (req, res) => {
  const productId = parseInt(req.body.productId);
  const products = [
    { id: 1, name: 'Товар 1', price: 100, image_url: 'https://via.placeholder.com/250' },
    { id: 2, name: 'Товар 2', price: 200, image_url: 'https://via.placeholder.com/250' },
    { id: 3, name: 'Товар 3', price: 300, image_url: 'https://via.placeholder.com/250' },
    { id: 4, name: 'Товар 4', price: 400, image_url: 'https://via.placeholder.com/250' },
    { id: 5, name: 'Товар 5', price: 500, image_url: 'https://via.placeholder.com/250' },
  ];
  const product = products.find(p => p.id === productId);

  if (product) {
    const cart = req.session.cart = req.session.cart || [];
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
  }
  res.redirect('/catalog');
});

app.post('/cart/clear', (req, res) => {
  req.session.cart = [];
  res.redirect('/cart');
});

app.get('/checkout', (req, res) => {
  res.render('checkout');
});

app.get('/product/:id', (req, res) => {
  const productId = req.params.id;
  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, products) => {
    if (err || products.length === 0) {
      res.status(404).send('Product not found');
      return;
    }
    db.query('SELECT * FROM reviews WHERE product_id = ?', [productId], (err, reviews) => {
      if (err) throw err;
      res.render('product', { product: products[0], reviews });
    });
  });
});

app.post('/place-order', (req, res) => {
  const { name, email } = req.body;
  const cart = req.session.cart || [];
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const order = {
    customer_name: name,
    customer_email: email,
    total_price: total
  };

  db.query('INSERT INTO orders SET ?', order, (err, result) => {
    if (err) throw err;
    const orderId = result.insertId;
    const orderItems = cart.map(item => [orderId, item.id, item.quantity, item.price]);
    db.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?', [orderItems], (err) => {
      if (err) throw err;
      req.session.cart = [];
      res.redirect('/thank-you');
    });
  });
});

app.get('/thank-you', (req, res) => {
  res.send('Спасибо за ваш заказ!');
});

app.get('/admin', (req, res) => {
  res.render('admin');
});

app.get('/admin/orders', (req, res) => {
  db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, orders) => {
    if (err) throw err;
    res.render('admin/orders', { orders });
  });
});

app.get('/admin/orders/:id', (req, res) => {
  const orderId = req.params.id;
  db.query('SELECT * FROM orders WHERE id = ?', [orderId], (err, orders) => {
    if (err || orders.length === 0) {
      res.status(404).send('Order not found');
      return;
    }
    const sql = `
      SELECT oi.*, p.name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;
    db.query(sql, [orderId], (err, items) => {
      if (err) throw err;
      res.render('admin/order', { order: orders[0], items });
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
