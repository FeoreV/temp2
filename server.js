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
  res.render('index');
});

app.get('/catalog', (req, res) => {
  const products = [
    { id: 1, name: 'Товар 1', price: 100, image_url: 'https://via.placeholder.com/250' },
    { id: 2, name: 'Товар 2', price: 200, image_url: 'https://via.placeholder.com/250' },
    { id: 3, name: 'Товар 3', price: 300, image_url: 'https://via.placeholder.com/250' },
    { id: 4, name: 'Товар 4', price: 400, image_url: 'https://via.placeholder.com/250' },
    { id: 5, name: 'Товар 5', price: 500, image_url: 'https://via.placeholder.com/250' },
  ];
  res.render('catalog', { products });
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
