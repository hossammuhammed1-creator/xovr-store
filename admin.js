const API_URL = "https://script.google.com/macros/s/AKfycbxYK1ig3sG2NPVFBnNBAsg-LWEoRpdbLeLXj2jgDTB-ki2KW9_u3J6AdcQ3UID4BxVO/exec";

const $ = id => document.getElementById(id);


// =========================
// LOGIN
// =========================

function login() {

  const email = $("email").value.trim();
  const password = $("password").value.trim();

  if (!email || !password) {
    $("loginMessage").textContent = "Enter email and password.";
    return;
  }

  $("loginBox").style.display = "none";
  $("adminPanel").style.display = "block";

  loadProducts();
}


// =========================
// LOGOUT
// =========================

function logout() {

  $("adminPanel").style.display = "none";
  $("loginBox").style.display = "block";

}


// =========================
// ADD PRODUCT
// =========================

async function addProduct() {

  const name = $("productName").value.trim();
  const price = $("productPrice").value.trim();
  const description = $("productDescription").value.trim();
  const image = $("productImage").value.trim();
  const colors = $("productColors").value.trim();
  const sizes = $("productSizes").value.trim();

  const status = $("status");

  if (!name) {
    status.textContent = "Please enter product name.";
    return;
  }

  if (!price) {
    status.textContent = "Please enter product price.";
    return;
  }

  if (!image) {
    status.textContent = "Please enter image URL.";
    return;
  }

  status.textContent = "Saving product...";

  const product = {
    action: "addProduct",
    id: Date.now().toString(),
    name: name,
    price: Number(price),
    description: description,
    image: image,
    colors: colors,
    sizes: sizes
  };

  try {

    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(product)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Could not save product.");
    }

    status.textContent = "Product saved successfully!";

    $("productName").value = "";
    $("productPrice").value = "";
    $("productDescription").value = "";
    $("productImage").value = "";
    $("productColors").value = "";
    $("productSizes").value = "";

    loadProducts();

  } catch (error) {

    console.error(error);

    status.textContent = "Error: " + error.message;

  }

}


// =========================
// LOAD PRODUCTS
// =========================

async function loadProducts() {

  const list = $("productsList");

  list.innerHTML = "Loading products...";

  try {

    const response = await fetch(API_URL);
    const products = await response.json();

    list.innerHTML = "";

    if (!products.length) {
      list.innerHTML = "<p>No products yet.</p>";
      return;
    }

    products.forEach(product => {

      const item = document.createElement("div");

      item.className = "product-item";

      item.innerHTML = `
        <img src="${product.image || ""}" alt="">
        <div>
          <h3>${product.name || ""}</h3>
          <p>${product.price || ""}</p>
          <p>${product.colors || ""}</p>
          <p>${product.sizes || ""}</p>
        </div>
      `;

      list.appendChild(item);

    });

  } catch (error) {

    console.error(error);

    list.innerHTML =
      "<p>Could not load products.</p>";

  }

}


// =========================
// START
// =========================

$("adminPanel").style.display = "none";
