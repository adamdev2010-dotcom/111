const form = document.getElementById('add-product-form');
const list = document.getElementById('existing-products');

function fetchProducts() {
  fetch('/api/products')
    .then(res => res.json())
    .then(products => {
      window.products = products;
      renderProducts();
    });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const newProduct = {
    name: document.getElementById('name').value,
    price: Number(document.getElementById('price').value),
    image: document.getElementById('image').value,
    category: document.getElementById('category').value,
    description: document.getElementById('description').value
  };
  fetch('/api/products', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({action:'add', product:newProduct})
  }).then(()=> {
    form.reset();
    fetchProducts();
  });
});

function renderProducts() {
  list.innerHTML = '';
  window.products.forEach((p, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${p.name}</strong> - $${p.price} 
      <span class="category-badge">[${p.category || 'General'}]</span>
      <button onclick="deleteProduct(${i})">Delete</button>
    `;
    list.appendChild(li);
  });
}

function deleteProduct(index) {
  fetch('/api/products', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({action:'delete', index:index})
  }).then(()=> fetchProducts());
}

// تحميل المنتجات عند فتح الصفحة
fetchProducts();
