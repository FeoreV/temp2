document.addEventListener('DOMContentLoaded', () => {
  const filterForm = document.querySelector('.filters');
  const searchInput = document.querySelector('.search-bar input');
  const sortSelect = document.querySelector('.sort select');
  const priceSlider = document.querySelector('input[type="range"]');

  async function updateProducts() {
    const filterData = new FormData(filterForm);
    const searchQuery = searchInput.value;
    const sortBy = sortSelect.value;
    const price = priceSlider.value;
    const params = new URLSearchParams();

    // Handle checkboxes for categories
    const categories = filterData.getAll('category');
    if (categories.length > 0) {
      params.append('category', categories.join(','));
    }

    // Handle checkboxes for brands
    const brands = filterData.getAll('brand');
    if (brands.length > 0) {
      params.append('brand', brands.join(','));
    }

    if (searchQuery) {
      params.append('search', searchQuery);
    }
    if (sortBy) {
      params.append('sort', sortBy);
    }
    if (price) {
      params.append('price', price);
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

  const searchButton = document.querySelector('.search-bar button');
  if (searchButton) {
    searchButton.addEventListener('click', updateProducts);
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
