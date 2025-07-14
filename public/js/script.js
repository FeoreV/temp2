document.addEventListener('DOMContentLoaded', () => {
  const filterForm = document.querySelector('.filters');
  const searchInput = document.querySelector('.search-bar input');
  const sortSelect = document.querySelector('.sort select');

  async function updateProducts() {
    const filterData = new FormData(filterForm);
    const searchQuery = searchInput.value;
    const sortBy = sortSelect.value;
    const params = new URLSearchParams(filterData);
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    if (sortBy) {
      params.append('sort', sortBy);
    }
    const response = await fetch(`/api/products?${params}`);
    const products = await response.json();
    renderProducts(products);
  }

  if (filterForm) {
    filterForm.addEventListener('change', updateProducts);
  }

  if (searchInput) {
    searchInput.addEventListener('input', updateProducts);
  }
});

function renderProducts(products) {
  const productList = document.querySelector('.product-list');
  productList.innerHTML = '';
  products.forEach(product => {
    const productCard = `
      <div class="product-card">
        <img src="${product.image_url}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>Цена: ${product.price} руб.</p>
        <form action="/cart/add" method="post">
          <input type="hidden" name="productId" value="${product.id}">
          <button type="submit" class="btn">В корзину</button>
        </form>
      </div>
    `;
    productList.innerHTML += productCard;
  });
}
