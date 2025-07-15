const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
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
  db.query('SELECT * FROM banners', (err, banners) => {
    if (err) throw err;
    db.query('SELECT * FROM categories LIMIT 3', (err, categories) => {
      if (err) throw err;
      db.query('SELECT * FROM products ORDER BY id DESC LIMIT 4', (err, newProducts) => {
        if (err) throw err;
        db.query('SELECT * FROM products ORDER BY RAND() LIMIT 4', (err, bestSellers) => {
          if (err) throw err;
          res.render('index', { banners, categories, newProducts, bestSellers });
        });
      });
    });
  });
});

// Product routes
app.get('/admin/products', requireAdmin, (req, res) => {
  db.query('SELECT * FROM products', (err, products) => {
    if (err) throw err;
    res.render('admin/products', { products });
  });
});

app.get('/admin/products/add', requireAdmin, (req, res) => {
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

app.post('/admin/products/add', requireAdmin, (req, res) => {
  db.query('INSERT INTO products SET ?', req.body, (err) => {
    if (err) throw err;
    res.redirect('/admin/products');
  });
});

// Category routes
app.get('/admin/categories', requireAdmin, (req, res) => {
  db.query('SELECT * FROM categories', (err, categories) => {
    if (err) throw err;
    res.render('admin/categories', { categories });
  });
});

app.get('/admin/categories/add', requireAdmin, (req, res) => {
  res.render('admin/category-form', {
    title: 'Добавить категорию',
    action: '/admin/categories/add',
    submitText: 'Добавить',
    category: {}
  });
});

app.post('/admin/categories/add', requireAdmin, (req, res) => {
  db.query('INSERT INTO categories SET ?', req.body, (err) => {
    if (err) throw err;
    res.redirect('/admin/categories');
  });
});

// Brand routes
app.get('/admin/brands', requireAdmin, (req, res) => {
  db.query('SELECT * FROM brands', (err, brands) => {
    if (err) throw err;
    res.render('admin/brands', { brands });
  });
});

app.get('/admin/brands/add', requireAdmin, (req, res) => {
  res.render('admin/brand-form', {
    title: 'Добавить бренд',
    action: '/admin/brands/add',
    submitText: 'Добавить',
    brand: {}
  });
});

app.post('/admin/brands/add', requireAdmin, (req, res) => {
  db.query('INSERT INTO brands SET ?', req.body, (err) => {
    if (err) throw err;
    res.redirect('/admin/brands');
  });
});

app.get('/admin/brands/edit/:id', requireAdmin, (req, res) => {
  const brandId = req.params.id;
  db.query('SELECT * FROM brands WHERE id = ?', [brandId], (err, brands) => {
    if (err || brands.length === 0) {
      res.status(404).send('Brand not found');
      return;
    }
    res.render('admin/brand-form', {
      title: 'Редактировать бренд',
      action: `/admin/brands/edit/${brandId}`,
      submitText: 'Сохранить',
      brand: brands[0]
    });
  });
});

app.post('/admin/brands/edit/:id', requireAdmin, (req, res) => {
  const brandId = req.params.id;
  db.query('UPDATE brands SET ? WHERE id = ?', [req.body, brandId], (err) => {
    if (err) throw err;
    res.redirect('/admin/brands');
  });
});

app.post('/admin/brands/delete/:id', requireAdmin, (req, res) => {
  const brandId = req.params.id;
  db.query('DELETE FROM brands WHERE id = ?', [brandId], (err) => {
    if (err) throw err;
    res.redirect('/admin/brands');
  });
});

app.get('/admin/categories/edit/:id', requireAdmin, (req, res) => {
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

app.post('/admin/categories/edit/:id', requireAdmin, (req, res) => {
  const categoryId = req.params.id;
  db.query('UPDATE categories SET ? WHERE id = ?', [req.body, categoryId], (err) => {
    if (err) throw err;
    res.redirect('/admin/categories');
  });
});

app.post('/admin/categories/delete/:id', requireAdmin, (req, res) => {
  const categoryId = req.params.id;
  db.query('DELETE FROM categories WHERE id = ?', [categoryId], (err) => {
    if (err) throw err;
    res.redirect('/admin/categories');
  });
});

app.get('/admin/products/edit/:id', requireAdmin, (req, res) => {
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

app.post('/admin/products/edit/:id', requireAdmin, (req, res) => {
  const productId = req.params.id;
  db.query('UPDATE products SET ? WHERE id = ?', [req.body, productId], (err) => {
    if (err) throw err;
    res.redirect('/admin/products');
  });
});

app.post('/admin/products/delete/:id', requireAdmin, (req, res) => {
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

app.post('/admin/products/import', requireAdmin, upload.single('csv'), (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      // Assuming CSV columns are: name, description, price, category_name, brand_name, image_url
      results.push(data);
    })
    .on('end', async () => {
      try {
        for (const product of results) {
          // Find or create category
          let categoryId;
          const [catRows] = await db.promise().query('SELECT id FROM categories WHERE name = ?', [product.category_name]);
          if (catRows.length > 0) {
            categoryId = catRows[0].id;
          } else {
            const [newCat] = await db.promise().query('INSERT INTO categories (name) VALUES (?)', [product.category_name]);
            categoryId = newCat.insertId;
          }

          // Find or create brand
          let brandId;
          const [brandRows] = await db.promise().query('SELECT id FROM brands WHERE name = ?', [product.brand_name]);
          if (brandRows.length > 0) {
            brandId = brandRows[0].id;
          } else {
            const [newBrand] = await db.promise().query('INSERT INTO brands (name) VALUES (?)', [product.brand_name]);
            brandId = newBrand.insertId;
          }

          // Insert product
          const newProduct = {
            name: product.name,
            description: product.description,
            price: product.price,
            category_id: categoryId,
            brand_id: brandId,
            image_url: product.image_url
          };
          await db.promise().query('INSERT INTO products SET ?', newProduct);
        }
        fs.unlinkSync(req.file.path); // remove uploaded file
        res.redirect('/admin/products');
      } catch (err) {
        console.error(err);
        res.status(500).send('Error importing products');
      }
    });
});

app.get('/api/products', (req, res) => {
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
        // Popularity can be implemented, for example, by number of orders
        // For now, let's sort by name as a placeholder
        sql += ' ORDER BY name ASC';
        break;
      case 'newest':
        sql += ' ORDER BY id DESC';
        break;
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

app.post('/cart/remove', (req, res) => {
  const productId = parseInt(req.body.productId);
  let cart = req.session.cart || [];
  cart = cart.filter(item => item.id !== productId);
  req.session.cart = cart;
  res.redirect('/cart');
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

// Middleware to protect admin routes
const requireAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

app.get('/admin/login', (req, res) => {
  res.render('admin/login');
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM admins WHERE username = ?', [username], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      bcrypt.compare(password, results[0].password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          req.session.isAdmin = true;
          res.redirect('/admin');
        } else {
          res.send('Incorrect password');
        }
      });
    } else {
      res.send('Admin not found');
    }
  });
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Script to add a new admin
app.get('/admin/add-admin', (req, res) => {
    const saltRounds = 10;
    const plainPassword = 'admin'; // Replace with a strong password
    bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
        if (err) throw err;
        db.query('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', hash], (err, result) => {
            if (err) throw err;
            res.send('Admin user created!');
        });
    });
});

app.get('/admin', requireAdmin, (req, res) => {
  res.render('admin');
});

app.get('/admin/orders', requireAdmin, (req, res) => {
  db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, orders) => {
    if (err) throw err;
    res.render('admin/orders', { orders });
  });
});

app.get('/admin/orders/:id', requireAdmin, (req, res) => {
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

// Banner routes
app.get('/admin/banners', requireAdmin, (req, res) => {
  db.query('SELECT * FROM banners', (err, banners) => {
    if (err) throw err;
    res.render('admin/banners', { banners });
  });
});

app.get('/admin/banners/add', requireAdmin, (req, res) => {
  res.render('admin/banner-form', {
    title: 'Добавить баннер',
    action: '/admin/banners/add',
    submitText: 'Добавить',
    banner: {}
  });
});

app.post('/admin/banners/add', requireAdmin, (req, res) => {
  db.query('INSERT INTO banners SET ?', req.body, (err) => {
    if (err) throw err;
    res.redirect('/admin/banners');
  });
});

app.get('/admin/banners/edit/:id', requireAdmin, (req, res) => {
  const bannerId = req.params.id;
  db.query('SELECT * FROM banners WHERE id = ?', [bannerId], (err, banners) => {
    if (err || banners.length === 0) {
      res.status(404).send('Banner not found');
      return;
    }
    res.render('admin/banner-form', {
      title: 'Редактировать баннер',
      action: `/admin/banners/edit/${bannerId}`,
      submitText: 'Сохранить',
      banner: banners[0]
    });
  });
});

app.post('/admin/banners/edit/:id', requireAdmin, (req, res) => {
  const bannerId = req.params.id;
  db.query('UPDATE banners SET ? WHERE id = ?', [req.body, bannerId], (err) => {
    if (err) throw err;
    res.redirect('/admin/banners');
  });
});

app.post('/admin/banners/delete/:id', requireAdmin, (req, res) => {
  const bannerId = req.params.id;
  db.query('DELETE FROM banners WHERE id = ?', [bannerId], (err) => {
    if (err) throw err;
    res.redirect('/admin/banners');
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
