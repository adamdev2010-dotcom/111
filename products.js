document.addEventListener("DOMContentLoaded", () => {
  fetch("products.json")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("products-container");

      data.forEach(product => {
        const div = document.createElement("div");
        div.classList.add("product-card");

        div.innerHTML = `
          <img src="${product.image}" alt="${product.name}">
          <h2>${product.name}</h2>
          <p>${product.price} EGP</p>
          <button class="btn">Add to Cart</button>
        `;
        container.appendChild(div);
      });
    })
    .catch(err => console.error("Error loading products:", err));
});