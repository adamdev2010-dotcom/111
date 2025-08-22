let cart = [];
let allProducts = [];
let currentCategory = 'all';

// Toggle slider menu
function toggleSlider() {
  const slider = document.getElementById('slider-menu');
  if (slider) {
    slider.classList.toggle('open');
  }
}

// Close slider when clicking outside
document.addEventListener('click', function(event) {
  const slider = document.getElementById('slider-menu');
  const sliderBtn = document.getElementById('slider-btn');
  
  if (slider && sliderBtn && !slider.contains(event.target) && !sliderBtn.contains(event.target)) {
    slider.classList.remove('open');
  }
});

// Check if user is logged in
function checkAuth() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const authLinks = document.getElementById('auth-links');
  const authLinksSlider = document.getElementById('auth-links-slider');
  
  if (user && user.name) {
    const userHtml = `
      <div class="user-info">
        <svg class="user-icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 3.5C14.8 3.5 14.6 3.5 14.5 3.5L12 5L9.5 3.5C9.4 3.5 9.2 3.5 9 3.5L3 7V9H21ZM12 7C12.8 7 13.5 7.2 14.1 7.6L15.5 9H8.5L9.9 7.6C10.5 7.2 11.2 7 12 7Z"/>
        </svg>
        <span>Welcome, ${user.name}</span>
        <button class="logout-btn" onclick="logout()">Logout</button>
      </div>
    `;
    
    if (authLinks) {
      authLinks.innerHTML = userHtml;
    }
    if (authLinksSlider) {
      authLinksSlider.innerHTML = userHtml;
    }
  }
}

// Load featured products for home page
function loadFeaturedProducts() {
  const featuredGrid = document.getElementById('featured-products-grid');
  if (featuredGrid && window.products && window.products.length > 0) {
    const featuredProducts = window.products.slice(0, 3);
    featuredProducts.forEach((product, index) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p class="price">$${product.price}</p>
        <p>${product.description || 'Premium quality product'}</p>
        <span class="category-tag">${product.category || 'General'}</span>
        <button onclick="window.location.href='shop.html'">View Product</button>
      `;
      featuredGrid.appendChild(card);
    });
  }
}

function logout() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user) {
    // Update user session in database
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({userId: user.id})
    });
  }
  localStorage.removeItem('user');
  alert('Logged out successfully!');
  window.location.reload();
}

// Check for persistent login on page load
function checkPersistentLogin() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user) {
    // Verify user session with server
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({userId: user.id, sessionToken: user.sessionToken})
    })
    .then(res => res.json())
    .then(result => {
      if (!result.valid) {
        localStorage.removeItem('user');
        window.location.reload();
      }
    })
    .catch(() => {
      // If verification fails, keep local session
    });
  }
}

// Initialize auth check when page loads
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  checkPersistentLogin();
  
  // Load products for both shop and home pages
  fetch('/api/products')
    .then(res => res.json())
    .then(products => {
      allProducts = products;
      window.products = products;
      
      // Display products if on shop page
      if (document.getElementById('products-container')) {
        displayProducts(products);
      }
      
      // Load featured products if on home page
      if (document.getElementById('featured-products-grid')) {
        loadFeaturedProducts();
      }
    })
    .catch(error => {
      console.log('Products not loaded:', error);
    });
});

function displayProducts(products) {
  const container = document.getElementById('products-container');
  container.innerHTML = '';
  
  products.forEach((p, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="price">$${p.price}</p>
      <p>${p.description}</p>
      <span class="category-tag">${p.category || 'General'}</span>
      <button onclick="addToCart(${index})">Add to Cart</button>
    `;
    container.appendChild(card);
  });
}

function filterProducts(category) {
  currentCategory = category;
  const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
  
  let filtered = allProducts;
  
  if (category !== 'all') {
    filtered = filtered.filter(product => 
      product.category && product.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  if (searchTerm) {
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      (product.category && product.category.toLowerCase().includes(searchTerm))
    );
  }
  
  displayProducts(filtered);
}

function searchProducts() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  
  let filtered = allProducts;
  
  if (currentCategory !== 'all') {
    filtered = filtered.filter(product => 
      product.category && product.category.toLowerCase() === currentCategory.toLowerCase()
    );
  }
  
  if (searchTerm) {
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      (product.category && product.category.toLowerCase().includes(searchTerm))
    );
  }
  
  displayProducts(filtered);
}

function addToCart(index) {
  const product = window.products[index];
  cart.push(product);
  document.getElementById('cart-count').innerText = cart.length;
  updateCartModal();
}

function updateCartModal() {
  const cartItems = document.getElementById('cart-items');
  cartItems.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} - $${item.price}`;
    cartItems.appendChild(li);
  });
}

document.getElementById('cart-icon').addEventListener('click', () => {
  document.getElementById('cart-modal').classList.toggle('visible');
});

document.getElementById('checkout-btn').addEventListener('click', () => {
  let body = "Order Details:\n";
  cart.forEach(item => {
    body += `${item.name} - $${item.price}\n`;
  });
  window.location.href = `mailto:your-email@example.com?subject=New Order&body=${encodeURIComponent(body)}`;
});
