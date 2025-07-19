const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const db = require('../database');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getLoginStats } = require('../middleware/bruteforce');

const upload = multer({ dest: 'uploads/' });

// Admin dashboard
router.get('/', requireAuth, (req, res) => {
  res.render('admin', { 
    user: {
      username: req.session.username,
      role: req.session.role,
      email: req.session.email
    }
  });
});

// Product management
router.get('/products', requireAuth, (req, res) => {
  db.query('SELECT * FROM products', (err, products) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.render('admin/products', { products });
  });
});

router.get('/products/add', requireAuth, (req, res) => {
  db.query('SELECT * FROM categories', (err, categories) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.render('admin/product-form', {
      title: 'Добавить товар',
      action: '/admin/products/add',
      submitText: 'Добавить',
      product: {},
      categories
    });
  });
});

router.post('/products/add', requireAuth, (req, res) => {
  db.query('INSERT INTO products SET ?', req.body, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.redirect('/admin/products');
  });
});

router.get('/products/edit/:id', requireAuth, (req, res) => {
  const productId = req.params.id;
  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, products) => {
    if (err || products.length === 0) {
      res.status(404).send('Product not found');
      return;
    }
    db.query('SELECT * FROM categories', (err, categories) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
      }
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

router.post('/products/edit/:id', requireAuth, (req, res) => {
  const productId = req.params.id;
  db.query('UPDATE products SET ? WHERE id = ?', [req.body, productId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.redirect('/admin/products');
  });
});

router.post('/products/delete/:id', requireAuth, (req, res) => {
  const productId = req.params.id;
  db.query('DELETE FROM products WHERE id = ?', [productId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.redirect('/admin/products');
  });
});

router.post('/products/import', requireAuth, upload.single('csv'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Файл не был загружен. Пожалуйста, выберите CSV-файл.');
  }
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(Object.values(data)))
    .on('end', () => {
      const sql = 'INSERT INTO products (name, description, price, category_id, image_url) VALUES ?';
      db.query(sql, [results], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
        }
        fs.unlinkSync(req.file.path);
        res.redirect('/admin/products');
      });
    });
});

// Category management
router.get('/categories', requireAuth, (req, res) => {
  db.query('SELECT * FROM categories', (err, categories) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.render('admin/categories', { categories });
  });
});

router.get('/categories/add', requireAuth, (req, res) => {
  res.render('admin/category-form', {
    title: 'Добавить категорию',
    action: '/admin/categories/add',
    submitText: 'Добавить',
    category: {}
  });
});

router.post('/categories/add', requireAuth, (req, res) => {
  db.query('INSERT INTO categories SET ?', req.body, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.redirect('/admin/categories');
  });
});

router.get('/categories/edit/:id', requireAuth, (req, res) => {
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

router.post('/categories/edit/:id', requireAuth, (req, res) => {
  const categoryId = req.params.id;
  db.query('UPDATE categories SET ? WHERE id = ?', [req.body, categoryId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.redirect('/admin/categories');
  });
});

router.post('/categories/delete/:id', requireAuth, (req, res) => {
  const categoryId = req.params.id;
  db.query('DELETE FROM categories WHERE id = ?', [categoryId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.redirect('/admin/categories');
  });
});

// Brand management
router.get('/brands', requireAuth, (req, res) => {
  db.query('SELECT * FROM brands', (err, brands) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.render('admin/brands', { brands });
  });
});

router.get('/brands/add', requireAuth, (req, res) => {
  res.render('admin/brand-form', {
    title: 'Добавить бренд',
    action: '/admin/brands/add',
    submitText: 'Добавить',
    brand: {}
  });
});

router.post('/brands/add', requireAuth, (req, res) => {
  db.query('INSERT INTO brands SET ?', req.body, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.redirect('/admin/brands');
  });
});

router.get('/brands/edit/:id', requireAuth, (req, res) => {
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

router.post('/brands/edit/:id', requireAuth, (req, res) => {
  const brandId = req.params.id;
  db.query('UPDATE brands SET ? WHERE id = ?', [req.body, brandId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.redirect('/admin/brands');
  });
});

router.post('/brands/delete/:id', requireAuth, (req, res) => {
  const brandId = req.params.id;
  db.query('DELETE FROM brands WHERE id = ?', [brandId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.redirect('/admin/brands');
  });
});

// Order management
router.get('/orders', requireAuth, (req, res) => {
  db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, orders) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.render('admin/orders', { orders });
  });
});

router.get('/orders/:id', requireAuth, (req, res) => {
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
      if (err) {
        console.error(err);
        return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
      }
      res.render('admin/order', { order: orders[0], items });
    });
  });
});

// Security management
router.get('/security', requireAuth, (req, res) => {
  // Получаем статистику попыток входа
  getLoginStats((err, stats) => {
    if (err) {
      console.error('Ошибка при получении статистики:', err);
      stats = [];
    }

    // Получаем подозрительные IP адреса
    db.query('SELECT * FROM suspicious_ips LIMIT 20', (err, suspicious_ips) => {
      if (err) {
        console.error('Ошибка при получении подозрительных IP:', err);
        suspicious_ips = [];
      }

      // Получаем заблокированные IP адреса
      db.query('SELECT * FROM ip_blacklist ORDER BY created_at DESC LIMIT 50', (err, blacklisted_ips) => {
        if (err) {
          console.error('Ошибка при получении заблокированных IP:', err);
          blacklisted_ips = [];
        }

        // Получаем последние попытки входа
        db.query('SELECT * FROM login_attempts ORDER BY created_at DESC LIMIT 50', (err, recent_attempts) => {
          if (err) {
            console.error('Ошибка при получении последних попыток:', err);
            recent_attempts = [];
          }

          // Вычисляем общую статистику
          const totalStats = {
            total_attempts: stats.reduce((sum, stat) => sum + parseInt(stat.total_attempts), 0),
            successful_attempts: stats.reduce((sum, stat) => sum + parseInt(stat.successful_attempts), 0),
            failed_attempts: stats.reduce((sum, stat) => sum + parseInt(stat.failed_attempts), 0),
            success_rate: stats.length > 0 ? 
              Math.round((stats.reduce((sum, stat) => sum + parseInt(stat.successful_attempts), 0) / 
                         stats.reduce((sum, stat) => sum + parseInt(stat.total_attempts), 0)) * 100) : 0
          };

          res.render('admin/security', {
            user: {
              username: req.session.username,
              role: req.session.role,
              email: req.session.email
            },
            stats: totalStats,
            suspicious_ips,
            blacklisted_ips,
            recent_attempts
          });
        });
      });
    });
  });
});

// API для блокировки IP
router.post('/security/block-ip', requireAuth, (req, res) => {
  const { ip } = req.body;
  
  if (!ip) {
    return res.json({ success: false, error: 'IP адрес не указан' });
  }

  db.query('CALL BlockIP(?, ?, ?)', [ip, 'Ручная блокировка администратором', 24], (err) => {
    if (err) {
      console.error('Ошибка при блокировке IP:', err);
      return res.json({ success: false, error: 'Ошибка при блокировке IP' });
    }
    
    res.json({ success: true });
  });
});

// API для разблокировки IP
router.post('/security/unblock-ip', requireAuth, (req, res) => {
  const { ip } = req.body;
  
  if (!ip) {
    return res.json({ success: false, error: 'IP адрес не указан' });
  }

  db.query('CALL UnblockIP(?)', [ip], (err) => {
    if (err) {
      console.error('Ошибка при разблокировке IP:', err);
      return res.json({ success: false, error: 'Ошибка при разблокировке IP' });
    }
    
    res.json({ success: true });
  });
});

// Banner management
router.get('/banners', requireAuth, (req, res) => {
  db.query('SELECT * FROM banners ORDER BY sort_order ASC', (err, banners) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.render('admin/banners', { banners });
  });
});

router.get('/banners/add', requireAuth, (req, res) => {
  res.render('admin/banner-form', {
    title: 'Добавить баннер',
    action: '/admin/banners/add',
    submitText: 'Добавить',
    banner: {}
  });
});

router.post('/banners/add', requireAuth, (req, res) => {
  db.query('INSERT INTO banners SET ?', req.body, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.redirect('/admin/banners');
  });
});

router.get('/banners/edit/:id', requireAuth, (req, res) => {
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

router.post('/banners/edit/:id', requireAuth, (req, res) => {
  const bannerId = req.params.id;
  db.query('UPDATE banners SET ? WHERE id = ?', [req.body, bannerId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.redirect('/admin/banners');
  });
});

router.post('/banners/delete/:id', requireAuth, (req, res) => {
  const bannerId = req.params.id;
  db.query('DELETE FROM banners WHERE id = ?', [bannerId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.redirect('/admin/banners');
  });
});

router.post('/banners/toggle/:id', requireAuth, (req, res) => {
  const bannerId = req.params.id;
  db.query('UPDATE banners SET is_active = NOT is_active WHERE id = ?', [bannerId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Произошла ошибка на сервере. Попробуйте позже.');
    }
    res.redirect('/admin/banners');
  });
});

module.exports = router; 