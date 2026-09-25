const SUPABASE_URL = "https://eumcldmkvkcacsaybnxf.supabase.co";
const SUPABASE_KEY = "sb_publishable_BnPkZg1Hm8e0IVLYAZto-A_prOtX1aC";

const productsContainer = document.getElementById("products");

async function loadProducts() {
  try {
    productsContainer.innerHTML = "<p>Loading collection...</p>";

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const products = await response.json();

    if (!products.length) {
      productsContainer.innerHTML =
        "<p>No products available yet.</p>";
      return;
    }

    productsContainer.innerHTML = "";

    products.forEach(product => {
      const card = document.createElement("article");

      card.className = "product-card";

      card.innerHTML = `
        <a href="product.html?id=${product.id}" class="product-image-link">
          <img
            src="${product.image || ""}"
            alt="${escapeHTML(product.name || "XOVR Product")}"
            class="product-image"
          >
        </a>

        <div class="product-info">

          <p class="product-label">XOVR</p>

          <h3>${escapeHTML(product.name || "")}</h3>

          <p class="product-price">
            ${product.price || ""} EGP
          </p>

          <a
            href="product.html?id=${product.id}"
            class="product-order-button"
          >
            ORDER NOW
          </a>

        </div>
      `;

      productsContainer.appendChild(card);
    });

  } catch (error) {
    console.error(error);

    productsContainer.innerHTML =
      "<p>Could not load products.</p>";
  }
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

loadProducts();
