const slides = document.querySelectorAll('.slide');
let current = 0;

// cart count
let cartCount = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if (i === index) slide.classList.add('active');
  });
}

document.querySelector('.next').addEventListener('click', () => {
  current = (current + 1) % slides.length;
  showSlide(current);
});

document.querySelector('.prev').addEventListener('click', () => {
  current = (current - 1 + slides.length) % slides.length;
  showSlide(current);
});

// Auto slide every 6s
setInterval(() => {
  current = (current + 1) % slides.length;
  showSlide(current);
}, 6000);

// =================== PRODUCTS + PAGINATION =================== //
const listOfProducts = document.getElementById('product-list');
const listOfProductsheading = document.getElementById('product-heading');

let currentPage = 1;
const productsPerPage = 8; // how many products per page
let allProducts = []; // store fetched products

async function loadProducts() {
  const res = await fetch('https://fakestoreapi.com/products/');
  allProducts = await res.json();
  renderProducts();
  renderPagination();
}

// console.log(allProducts);

const searchInput = document.getElementById('searchinput');  // Reference to search input field

searchInput.addEventListener('input', () => {
  filterProducts(searchInput.value);  // Call filterProducts on input change
   listOfProductsheading.scrollIntoView({ behavior: 'smooth' });
});

function filterProducts(query) {
  // Convert the search query to lowercase for case-insensitive search
  const filtered = allProducts.filter(product => 
    product.title.toLowerCase().includes(query.toLowerCase())
  );
  
  // Render filtered products based on search query
  renderProducts(filtered);
  renderPagination(filtered);  // Optionally, update pagination if you want
}

function renderProducts(products = allProducts) {
  listOfProducts.innerHTML = ""; // clear products

  if (products.length === 0) {
    // If no products match the search, show a "No results found" message
    const noResultsMessage = document.createElement('div');
    noResultsMessage.classList.add('no-results-message');
    noResultsMessage.innerText = "No results found";
    listOfProducts.appendChild(noResultsMessage);
    return;  // Exit the function early
  }

  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const paginatedItems = products.slice(start, end);

  paginatedItems.forEach(product => {
    const item = document.createElement('div');
    item.classList.add("product-card"); // styleable
    item.innerHTML = `
      <a href="product.html?id=${product.id}">
          <img src=${product.image} alt="${product.title}"/>
          <h3>${product.title}</h3>
      </a>
      <p>$${product.price}</p>
      <a href="product.html?id=${product.id}" class="btn">View Details</a>
    `;
    listOfProducts.appendChild(item);
  });
}

function renderPagination(products = allProducts) {
  const pagination = document.createElement("div");
  pagination.classList.add("pagination");

  const totalPages = Math.ceil(products.length / productsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.classList.add("page-btn");
    if (i === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      currentPage = i;
      renderProducts(products);
      renderPagination(products); // refresh UI
    });

    pagination.appendChild(btn);
  }

  // remove old pagination before inserting new
  const oldPagination = document.querySelector(".pagination");
  if (oldPagination) oldPagination.remove();

  listOfProducts.after(pagination); // add below products
}

// =================== DOM READY =================== //
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});


// Load featured products (random ones from API)
async function loadFeaturedProducts() {
  const res = await fetch('https://fakestoreapi.com/products/');
  const data = await res.json();

  // console.log(data);

  // Pick 4 random products
  const shuffled = data.sort(() => 0.5 - Math.random());
  const featured = shuffled.slice(0, 4);

  const featuredList = document.getElementById('featured-list');
  featured.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.innerHTML = `
      <a href="product.html?id=${product.id}">
        <img src="${product.image}" alt="${product.title}" />
        <h3>${product.title}</h3>
      </a>
      <p>$${product.price}</p>
      <a href="product.html?id=${product.id}" class="btn">View Details</a>
    `;
    featuredList.appendChild(card);
  });
}

async function loadCategories() {
  try {
    const res = await fetch('https://fakestoreapi.com/products/categories');
    const categories = await res.json();

    const container = document.getElementById('category-filters');
    container.innerHTML = ''; // Clear any static buttons

    // Add "All" button first
    const allBtn = document.createElement('button');
    allBtn.classList.add('category-btn', 'active');
    allBtn.setAttribute('data-category', 'all');
    allBtn.textContent = 'All';
    container.appendChild(allBtn);

    // Add one button per category
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.classList.add('category-btn');
      btn.setAttribute('data-category', cat);
      btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      container.appendChild(btn);
    });

    setupCategoryFilter(); // Attach filtering logic
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}

function setupCategoryFilter() {
  const categoryButtons = document.querySelectorAll('.category-btn');
  const categoryIndicator = document.querySelector('.category-indicator');

  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Highlight active button
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const selectedCategory = button.dataset.category;
      categoryIndicator.textContent = `Category: ${selectedCategory === 'all' ? 'All' : selectedCategory}`;

      const filtered = selectedCategory === 'all'
        ? allProducts
        : allProducts.filter(product => product.category.toLowerCase() === selectedCategory.toLowerCase());

      currentPage = 1;
      renderProducts(filtered);
      renderPagination(filtered);
      listOfProducts.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// Function to update cart count on index page load
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartCountSpan = document.querySelector(".cart-count");
  if (cartCountSpan) {
    cartCountSpan.textContent = count;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('nav-center').classList.toggle('open');
});
  Promise.all([loadProducts(), loadFeaturedProducts(), loadCategories(), updateCartCount()])
    .catch(err => console.error('Initialization error:', err));
});



