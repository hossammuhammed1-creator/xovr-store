const SUPABASE_URL = "https://eumcldmkvkcacsaybnxf.supabase.co";
const SUPABASE_KEY = "sb_publishable_BnPkZg1Hm8e0IVLYAZto-A_prOtX1aC";

const ADMIN_USERNAME = "Muhammed hossam";
const ADMIN_PASSWORD = "P101909714";

const $ = (id) => document.getElementById(id);

let selectedImage = null;
let editingProductId = null;


// =========================
// IMAGE SELECT
// =========================

$("mainImage").addEventListener("change", (e) => {

  selectedImage = e.target.files[0] || null;

  $("status").textContent = selectedImage
    ? "Selected: " + selectedImage.name
    : "";
});


// =========================
// LOGIN
// =========================

function login() {

  const username = $("email").value.trim();
  const password = $("password").value.trim();

  const loginMessage = $("loginMessage");

  if (!username || !password) {

    loginMessage.textContent =
      "Please enter username and password.";

    return;
  }

  if (
    username !== ADMIN_USERNAME ||
    password !== ADMIN_PASSWORD
  ) {

    loginMessage.textContent =
      "Wrong username or password.";

    return;
  }

  loginMessage.textContent = "";

  $("loginBox").style.display = "none";
  $("adminPanel").style.display = "block";

  loadProducts();
  loadOrders();
}


// =========================
// LOGOUT
// =========================

function logout() {

  $("adminPanel").style.display = "none";
  $("loginBox").style.display = "block";

  $("email").value = "";
  $("password").value = "";
  $("loginMessage").textContent = "";
}


// =========================
// ADD / UPDATE PRODUCT
// =========================

async function addProduct() {

  const name = $("productName").value.trim();
  const price = $("productPrice").value.trim();
  const description = $("productDescription").value.trim();
  const colors = $("productColors").value.trim();
  const sizes = $("productSizes").value.trim();

  const status = $("status");

  if (!name) {
    status.textContent = "Please enter product name.";
    return;
  }

  if (!price) {
    status.textContent = "Please enter price.";
    return;
  }

  try {

    let imageUrl = null;

    if (selectedImage) {

      status.textContent = "Uploading image...";

      const fileName =
        Date.now() + "_" +
        selectedImage.name.replace(/\s+/g, "-");

      const uploadResponse = await fetch(

        `${SUPABASE_URL}/storage/v1/object/product-images/${fileName}`,

        {
          method: "POST",

          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": selectedImage.type
          },

          body: selectedImage
        }
      );

      if (!uploadResponse.ok) {

        const errorText =
          await uploadResponse.text();

        throw new Error(
          "Image upload failed: " + errorText
        );
      }

      imageUrl =
        `${SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
    }


    if (editingProductId) {

      status.textContent = "Updating product...";

      const updateData = {

        name: name,
        price: Number(price),
        description: description,
        colors: colors,
        sizes: sizes
      };

      if (imageUrl) {
        updateData.image = imageUrl;
      }

      const response = await fetch(

        `${SUPABASE_URL}/rest/v1/products?id=eq.${editingProductId}`,

        {
          method: "PATCH",

          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },

          body: JSON.stringify(updateData)
        }
      );

      if (!response.ok) {

        throw new Error(
          "Product update failed: " +
          await response.text()
        );
      }

      status.textContent =
        "Product updated successfully!";

    } else {

      if (!imageUrl) {

        status.textContent =
          "Please choose an image.";

        return;
      }

      status.textContent =
        "Saving product...";

      const response = await fetch(

        `${SUPABASE_URL}/rest/v1/products`,

        {
          method: "POST",

          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },

          body: JSON.stringify({

            name: name,
            price: Number(price),
            description: description,
            image: imageUrl,
            colors: colors,
            sizes: sizes

          })
        }
      );

      if (!response.ok) {

        throw new Error(
          "Product save failed: " +
          await response.text()
        );
      }

      status.textContent =
        "Product added successfully!";
    }

    resetProductForm();
    loadProducts();

  }

  catch (error) {

    console.error(error);

    status.textContent =
      "Error: " + error.message;
  }
}


// =========================
// EDIT PRODUCT
// =========================

function editProduct(product) {

  editingProductId = product.id;

  $("productName").value =
    product.name || "";

  $("productPrice").value =
    product.price || "";

  $("productDescription").value =
    product.description || "";

  $("productColors").value =
    product.colors || "";

  $("productSizes").value =
    product.sizes || "";

  $("mainImage").value = "";

  selectedImage = null;

  $("status").textContent =
    "Editing: " + product.name;

  const saveButton =
    document.querySelector(".save-btn");

  if (saveButton) {
    saveButton.textContent =
      "UPDATE PRODUCT";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// =========================
// DELETE PRODUCT
// =========================

async function deleteProduct(id, name) {

  const confirmed =
    confirm(
      `Delete "${name}"?\n\nThis cannot be undone.`
    );

  if (!confirmed) {
    return;
  }

  try {

    const response = await fetch(

      `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,

      {
        method: "DELETE",

        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Prefer": "return=minimal"
        }
      }
    );

    if (!response.ok) {

      throw new Error(
        await response.text()
      );
    }

    $("status").textContent =
      "Product deleted successfully!";

    loadProducts();

  }

  catch (error) {

    console.error(error);

    $("status").textContent =
      "Delete error: " + error.message;
  }
}


// =========================
// RESET FORM
// =========================

function resetProductForm() {

  $("productName").value = "";
  $("productPrice").value = "";
  $("productDescription").value = "";
  $("productColors").value = "";
  $("productSizes").value = "";
  $("mainImage").value = "";

  selectedImage = null;
  editingProductId = null;

  const saveButton =
    document.querySelector(".save-btn");

  if (saveButton) {
    saveButton.textContent =
      "SAVE PRODUCT";
  }
}


// =========================
// LOAD PRODUCTS
// =========================

async function loadProducts() {

  const list =
    $("productsList");

  list.innerHTML =
    "Loading products...";

  try {

    const response = await fetch(

      `${SUPABASE_URL}/rest/v1/products?select=*`,

      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {

      throw new Error(
        await response.text()
      );
    }

    const products =
      await response.json();

    list.innerHTML = "";

    if (!products.length) {

      list.innerHTML =
        "<p>No products yet.</p>";

      return;
    }

    products.forEach(product => {

      const item =
        document.createElement("div");

      item.className =
        "product-item";

      item.innerHTML = `

        <img
          src="${product.image || ""}"
          alt=""
          style="
            width:100px;
            height:100px;
            object-fit:cover;
          "
        >

        <div>

          <h3>
            ${product.name || ""}
          </h3>

          <p>
            Price: ${product.price || ""}
          </p>

          <p>
            Colors: ${product.colors || ""}
          </p>

          <p>
            Sizes: ${product.sizes || ""}
          </p>

          <div style="
            margin-top:10px;
            display:flex;
            gap:8px;
          ">

            <button
              onclick='editProduct(${JSON.stringify(product)})'
              style="
                padding:8px 14px;
                cursor:pointer;
              "
            >
              EDIT
            </button>

            <button
              onclick='deleteProduct(${product.id}, ${JSON.stringify(product.name || "")})'
              style="
                padding:8px 14px;
                cursor:pointer;
              "
            >
              DELETE
            </button>

          </div>

        </div>
      `;

      list.appendChild(item);

    });

  }

  catch (error) {

    console.error(error);

    list.innerHTML =
      "<p>Could not load products.</p>";
  }
}


// =========================
// LOAD ORDERS
// =========================

async function loadOrders() {

  let ordersSection =
    document.getElementById("ordersSection");

  if (!ordersSection) {

    ordersSection =
      document.createElement("section");

    ordersSection.id =
      "ordersSection";

    ordersSection.className =
      "products-section";

    ordersSection.innerHTML = `

      <h2>Orders</h2>

      <div id="ordersList">
        Loading orders...
      </div>

    `;

    document
      .getElementById("adminPanel")
      .appendChild(ordersSection);
  }

  const list =
    document.getElementById("ordersList");

  list.innerHTML =
    "Loading orders...";

  try {

    const response = await fetch(

      `${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`,

      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "ORDERS ERROR:",
        errorText
      );

      list.innerHTML = `

        <div style="
          padding:15px;
          margin-top:10px;
          border:1px solid red;
          border-radius:10px;
          color:red;
          background:#fff5f5;
        ">

          <strong>Orders Error:</strong>

          <br><br>

          ${errorText}

        </div>

      `;

      return;
    }

    const orders =
      await response.json();

    if (!orders.length) {

      list.innerHTML =
        "<p>No orders yet.</p>";

      return;
    }

    list.innerHTML = "";

    orders.forEach(order => {

      const item =
        document.createElement("div");

      item.className =
        "order-item";

      const date =
        order.created_at
          ? new Date(order.created_at)
              .toLocaleString()
          : "";

      item.innerHTML = `

        <div style="
          padding:15px;
          margin-bottom:15px;
          border:1px solid #ddd;
          border-radius:10px;
        ">

          <h3>
            ${order.product_name || "Product"}
          </h3>

          <p>
            <strong>Customer:</strong>
            ${order.customer_name || ""}
          </p>

          <p>
            <strong>Phone:</strong>
            ${order.customer_phone || ""}
          </p>

          <p>
            <strong>Address:</strong>
            ${order.customer_address || ""}
          </p>

          <p>
            <strong>Color:</strong>
            ${order.color || ""}
          </p>

          <p>
            <strong>Size:</strong>
            ${order.size || ""}
          </p>

          <p>
            <strong>Quantity:</strong>
            ${order.quantity || ""}
          </p>

          <p>
            <strong>Price:</strong>
            ${order.price || ""}
          </p>

          <p>
            <strong>Order ID:</strong>
            ${order.id || ""}
          </p>

          <p>
            <strong>Date:</strong>
            ${date}
          </p>

          <button
            onclick="deleteOrder(${order.id})"
            style="
              margin-top:10px;
              padding:10px 16px;
              background:#000;
              color:#fff;
              border:none;
              border-radius:6px;
              cursor:pointer;
            "
          >
            DELETE ORDER
          </button>

        </div>

      `;

      list.appendChild(item);

    });

  }

  catch (error) {

    console.error(error);

    list.innerHTML = `

      <div style="
        padding:15px;
        color:red;
        border:1px solid red;
        border-radius:10px;
      ">

        <strong>Orders Error:</strong>
        <br><br>
        ${error.message}

      </div>

    `;
  }
}


// =========================
// DELETE ORDER
// =========================

async function deleteOrder(id) {

  const confirmed =
    confirm(
      "Delete this order?\n\nThis cannot be undone."
    );

  if (!confirmed) {
    return;
  }

  try {

    const response = await fetch(

      `${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`,

      {
        method: "DELETE",

        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Prefer": "return=minimal"
        }
      }
    );

    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(errorText);
    }

    alert("Order deleted successfully!");

    loadOrders();

  }

  catch (error) {

    console.error(error);

    alert(
      "Could not delete order:\n\n" +
      error.message
    );
  }
}


// =========================
// INITIAL STATE
// =========================

$("adminPanel").style.display = "none";
