// Get product ID from URL
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

async function loadProduct() {
  try {
    if (!productId) {
      document.getElementById("product-info").innerHTML = "<p>Product not found.</p>";
      return;
    }

    const res = await fetch(`https://fakestoreapi.com/products/${productId}`);
    const product = await res.json();

    // console.log(product);

    // Update product details
    document.getElementById("product-title").textContent = product.title;
    document.getElementById("product-description").textContent = product.description;
    document.getElementById("product-price").textContent = `$${product.price}`;
    document.getElementById('product-category').textContent = `${product.category}`
     document.getElementById('product-rating').textContent = `Rating: ${product.rating.rate}`
    document.querySelector("title").textContent = `Product details - ${product.title}`;

    // Image gallery
    const gallery = document.getElementById("product-gallery");
    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.title;
    gallery.appendChild(img);

    // Add to cart logic
    document.getElementById("add-to-cart").addEventListener("click", () => {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existing = cart.find(item => item.id === product.id);

      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        product.quantity = 1;
        cart.push(product);
      }

      localStorage.setItem("cart", JSON.stringify(cart));

      showNotification("Added to cart!");
      updateCartCount();
    });

    updateCartCount(); // Initial cart count
  } catch (error) {
    console.error("Error loading product:", error);
  }
}

// Show toast-style notification (uses #notification div in your HTML)
function showNotification(message) {
  const notif = document.getElementById("notification");
  notif.textContent = message;
  notif.style.display = "block";
  setTimeout(() => {
    notif.style.display = "none";
  }, 2000);
}

// Update the cart item count in the navbar
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartCountSpan = document.querySelector(".cart-count");
  if (cartCountSpan) {
    cartCountSpan.textContent = count;
  }
}

document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('nav-center').classList.toggle('open');
});

// Initialize product details
loadProduct();

