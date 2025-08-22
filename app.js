
let cart = [];
let products = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

async function initializeApp() {
  try {
    // Load products
    await loadProducts();
    
    // Initialize cart functionality
    initializeCart();
    
    // Initialize featured products on home page
    if (document.getElementById('featured-products-grid')) {
      displayFeaturedProducts();
    }
    
    // Initialize newsletter form
    initializeNewsletter();
    
    
    
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

// Load products from API
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (response.ok) {
      products = await response.json();
    } else {
      // Fallback to static products if API fails
      products = [
        {
          name: "Black T-Shirt",
          price: 20,
          image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
          description: "Soft cotton black t-shirt"
        },
        {
          name: "Blue Jeans",
          price: 40,
          image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop",
          description: "Comfortable blue jeans"
        },
        {
          name: "White Sneakers",
          price: 60,
          image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
          description: "Classic white sneakers"
        }
      ];
    }
  } catch (error) {
    console.error('Error loading products:', error);
    // Use fallback products
    products = [
      {
        name: "Black T-Shirt",
        price: 20,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
        description: "Soft cotton black t-shirt"
      },
      {
        name: "Blue Jeans",
        price: 40,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop",
        description: "Comfortable blue jeans"
      }
    ];
  }
}

// Display featured products on home page
function displayFeaturedProducts() {
  const container = document.getElementById('featured-products-grid');
  if (!container) return;
  
  // Show first 3 products as featured
  const featuredProducts = products.slice(0, 3);
  
  container.innerHTML = '';
  featuredProducts.forEach((product, index) => {
    const productCard = createProductCard(product, index);
    container.appendChild(productCard);
  });
}

// Create product card element
function createProductCard(product, index) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x300?text=Product+Image'">
    <h3>${product.name}</h3>
    <div class="price">$${product.price}</div>
    <p>${product.description}</p>
    <button onclick="addToCart(${index})">Add to Cart</button>
  `;
  return card;
}

// Cart functionality
function initializeCart() {
  // Load cart from localStorage
  const savedCart = localStorage.getItem('sotra-cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCount();
  }
  
  // Cart icon click handler
  const cartIcon = document.getElementById('cart-icon');
  if (cartIcon) {
    cartIcon.addEventListener('click', toggleCartModal);
  }
  
  // Create cart modal if it doesn't exist
  if (!document.getElementById('cart-modal')) {
    createCartModal();
  }
}

function createCartModal() {
  const modal = document.createElement('div');
  modal.id = 'cart-modal';
  modal.innerHTML = `
    <h2>Your Cart</h2>
    <ul id="cart-items"></ul>
    <div id="cart-total"></div>
    <button id="checkout-btn" onclick="checkout()">Checkout</button>
  `;
  document.body.appendChild(modal);
}

function addToCart(index) {
  const product = products[index];
  if (product) {
    cart.push(product);
    updateCartCount();
    updateCartModal();
    saveCartToStorage();
    
    // Show success feedback
    showNotification(`${product.name} added to cart!`);
  }
}

function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.textContent = cart.length;
  }
}

function updateCartModal() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  
  if (!cartItems) return;
  
  cartItems.innerHTML = '';
  let total = 0;
  
  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.name} - $${item.price}
      <button onclick="removeFromCart(${index})" style="margin-left: 10px; background: #e74c3c; color: white; border: none; padding: 2px 8px; border-radius: 3px; cursor: pointer;">×</button>
    `;
    cartItems.appendChild(li);
    total += item.price;
  });
  
  if (cartTotal) {
    cartTotal.textContent = `Total: $${total}`;
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartCount();
  updateCartModal();
  saveCartToStorage();
}

function toggleCartModal() {
  const modal = document.getElementById('cart-modal');
  if (modal) {
    modal.classList.toggle('visible');
    updateCartModal();
  }
}

function saveCartToStorage() {
  localStorage.setItem('sotra-cart', JSON.stringify(cart));
}

function checkout() {
  if (cart.length === 0) {
    showNotification('Your cart is empty!');
    return;
  }
  
  // Redirect to cart page
  window.location.href = 'cart.html';
}

// Newsletter functionality
function initializeNewsletter() {
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      showNotification('Thank you for subscribing!');
      this.reset();
    });
  }
}



// Utility function to show notifications
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #27ae60;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    z-index: 1001;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Close cart modal when clicking outside
document.addEventListener('click', function(e) {
  const modal = document.getElementById('cart-modal');
  const cartIcon = document.getElementById('cart-icon');
  
  if (modal && modal.classList.contains('visible') && 
      !modal.contains(e.target) && !cartIcon.contains(e.target)) {
    modal.classList.remove('visible');
  }
});
// Home page specific functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication status
  checkAuthFromScript();
  
  // Load featured products
  loadFeaturedProductsFromAPI();
  
  // Handle newsletter form
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      alert(`Thank you for subscribing with email: ${email}`);
      this.reset();
    });
  }
  
  // Handle cart icon click
  const cartIcon = document.getElementById('cart-icon');
  if (cartIcon) {
    cartIcon.addEventListener('click', function() {
      window.location.href = 'shop.html';
    });
  }
});

// Check authentication (simplified version for home page)
function checkAuthFromScript() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const authLinks = document.getElementById('auth-links');
  
  if (user && user.name && authLinks) {
    const userHtml = `
      <div class="user-info">
        <svg class="user-icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 3.5C14.8 3.5 14.6 3.5 14.5 3.5L12 5L9.5 3.5C9.4 3.5 9.2 3.5 9 3.5L3 7V9H21ZM12 7C12.8 7 13.5 7.2 14.1 7.6L15.5 9H8.5L9.9 7.6C10.5 7.2 11.2 7 12 7Z"/>
        </svg>
        <span>Welcome, ${user.name}</span>
        <button class="logout-btn" onclick="logoutFromHome()">Logout</button>
      </div>
    `;
    authLinks.innerHTML = userHtml;
  }
}

// Logout function for home page
function logoutFromHome() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user) {
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

// Load featured products from API
function loadFeaturedProductsFromAPI() {
  fetch('/api/products')
    .then(res => res.json())
    .then(products => {
      const featuredGrid = document.getElementById('featured-products-grid');
      if (featuredGrid && products.length > 0) {
        const featuredProducts = products.slice(0, 3);
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
    })
    .catch(error => {
      console.log('Featured products not loaded:', error);
    });
}
