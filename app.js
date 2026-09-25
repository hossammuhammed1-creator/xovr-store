const SUPABASE_URL = "https://eumcldmkvkcacsaybnxf.supabase.co";
const SUPABASE_KEY = "sb_publishable_BnPkZg1Hm8e0IVLYAZto-A_prOtX1aC";

const productsContainer = document.getElementById("products");
const productDetail = document.getElementById("product-detail");


// =========================
// HOME PAGE PRODUCTS
// =========================

async function loadProducts() {
  if (!productsContainer) return;

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


// =========================
// PRODUCT DETAILS PAGE
// =========================

async function loadProductDetails() {
  if (!productDetail) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    productDetail.innerHTML =
      "<p>Product not found.</p>";
    return;
  }

  try {
    productDetail.innerHTML =
      "<p>Loading product...</p>";

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(productId)}&select=*`,
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
      productDetail.innerHTML =
        "<p>Product not found.</p>";
      return;
    }

    const product = products[0];

    document.title =
      `${product.name || "Product"} — XOVR`;

    // COLORS
    const colors = product.colors
      ? product.colors
          .split(",")
          .map(color => color.trim())
          .filter(Boolean)
      : [];

    // SIZES
    const sizes = product.sizes
      ? product.sizes
          .split(",")
          .map(size => size.trim())
          .filter(Boolean)
      : [];

    productDetail.innerHTML = `

      <div class="product-gallery">
        <img
          src="${product.image || ""}"
          alt="${escapeHTML(product.name || "XOVR Product")}"
        >
      </div>

      <div class="detail-copy">

        <p class="eyebrow">XOVR / COLLECTION</p>

        <h1>
          ${escapeHTML(product.name || "")}
        </h1>

        <p class="detail-price">
          ${product.price || ""} EGP
        </p>

        <p class="detail-desc">
          ${escapeHTML(
            product.description ||
            "Designed by XOVR. Beyond Ordinary."
          )}
        </p>

        ${
          colors.length
            ? `
              <p class="option-title">COLOR</p>

              <div class="options" id="colorOptions">
                ${colors.map((color, index) => `
                  <button
                    type="button"
                    class="option ${index === 0 ? "active" : ""}"
                    data-color="${escapeHTML(color)}"
                  >
                    ${escapeHTML(color)}
                  </button>
                `).join("")}
              </div>
            `
            : ""
        }

        ${
          sizes.length
            ? `
              <p class="option-title">SIZE</p>

              <div class="options" id="sizeOptions">
                ${sizes.map((size, index) => `
                  <button
                    type="button"
                    class="option ${index === 0 ? "active" : ""}"
                    data-size="${escapeHTML(size)}"
                  >
                    ${escapeHTML(size)}
                  </button>
                `).join("")}
              </div>
            `
            : ""
        }

        <p class="option-title">QUANTITY</p>

        <div class="options">
          <button
            type="button"
            class="option active"
            id="quantityMinus"
          >
            −
          </button>

          <button
            type="button"
            class="option active"
            id="quantityValue"
          >
            1
          </button>

          <button
            type="button"
            class="option active"
            id="quantityPlus"
          >
            +
          </button>
        </div>

        <form class="order-form" id="orderForm">

          <input
            type="text"
            id="customerName"
            placeholder="Full Name"
            required
          >

          <input
            type="tel"
            id="customerPhone"
            placeholder="Phone Number"
            required
          >

          <input
            type="text"
            id="customerAddress"
            placeholder="Address"
            required
          >

          <button
            type="submit"
            class="btn btn-light"
          >
            PLACE ORDER
          </button>

        </form>

        <div
          id="orderMessage"
          style="margin-top:15px;"
        ></div>

      </div>
    `;

    // =========================
    // COLOR SELECTION
    // =========================

    document
      .querySelectorAll("#colorOptions .option")
      .forEach(button => {

        button.addEventListener("click", () => {

          document
            .querySelectorAll("#colorOptions .option")
            .forEach(btn =>
              btn.classList.remove("active")
            );

          button.classList.add("active");
        });

      });


    // =========================
    // SIZE SELECTION
    // =========================

    document
      .querySelectorAll("#sizeOptions .option")
      .forEach(button => {

        button.addEventListener("click", () => {

          document
            .querySelectorAll("#sizeOptions .option")
            .forEach(btn =>
              btn.classList.remove("active")
            );

          button.classList.add("active");
        });

      });


    // =========================
    // QUANTITY
    // =========================

    let quantity = 1;

    const quantityValue =
      document.getElementById("quantityValue");

    document
      .getElementById("quantityMinus")
      .addEventListener("click", () => {

        if (quantity > 1) {
          quantity--;
          quantityValue.textContent = quantity;
        }

      });

    document
      .getElementById("quantityPlus")
      .addEventListener("click", () => {

        quantity++;
        quantityValue.textContent = quantity;

      });


    // =========================
    // ORDER FORM
    // =========================

    document
      .getElementById("orderForm")
      .addEventListener("submit", event => {

        event.preventDefault();

        const name =
          document.getElementById("customerName").value.trim();

        const phone =
          document.getElementById("customerPhone").value.trim();

        const address =
          document.getElementById("customerAddress").value.trim();

        const selectedColor =
          document.querySelector(
            "#colorOptions .option.active"
          );

        const selectedSize =
          document.querySelector(
            "#sizeOptions .option.active"
          );

        const color =
          selectedColor
            ? selectedColor.dataset.color
            : "";

        const size =
          selectedSize
            ? selectedSize.dataset.size
            : "";

        const orderMessage =
          document.getElementById("orderMessage");

        orderMessage.innerHTML = `
          <div class="success">
            Thank you, ${escapeHTML(name)}.<br>
            Your order for
            <strong>${escapeHTML(product.name)}</strong>
            has been received.
          </div>
        `;

        console.log({
          product: product.name,
          productId: product.id,
          price: product.price,
          name: name,
          phone: phone,
          address: address,
          color: color,
          size: size,
          quantity: quantity
        });

      });

  } catch (error) {

    console.error(error);

    productDetail.innerHTML =
      "<p>Could not load product.</p>";
  }
}


// =========================
// SECURITY / HTML ESCAPE
// =========================

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}


// =========================
// START
// =========================

loadProducts();
loadProductDetails();
