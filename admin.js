const API_URL = "https://script.google.com/macros/s/AKfycbxYK1ig3sG2NPVFBnNBAsg-LWEoRpdbLeLXj2jgDTB-ki2KW9_u3J6AdcQ3UID4BxVO/exec";

const $ = id => document.getElementById(id);

let mainImageFile = null;


// IMAGE SELECTION
$("mainImage").addEventListener("change", e => {
  mainImageFile = e.target.files[0] || null;
});


// LOGIN
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


// LOGOUT
function logout() {
  $("adminPanel").style.display = "none";
  $("loginBox").style.display = "block";
}


// FILE TO BASE64
function fileToBase64(file) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = () => {

      const result = reader.result;

      resolve({
        name: file.name,
        type: file.type,
        data: result.split(",")[1]
      });

    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}


// ADD PRODUCT
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
    status.textContent = "Please enter product price.";
    return;
  }

  if (!mainImageFile) {
    status.textContent = "Please choose a main image.";
    return;
  }

  status.textContent = "Uploading product...";

  try {

    const image = await fileToBase64(mainImageFile);

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
    $("productColors").value = "";
    $("productSizes").value = "";
    $("mainImage").value = "";

    mainImageFile = null;

    loadProducts();

  } catch (error) {

    console.error(error);

    status.textContent = "Error: " + error.message;
  }
}


// LOAD PRODUCTS
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
        <img src="${product.Image || ""}" alt="">
        <div>
          <h3>${product.Name || ""}</h3>
          <p>${product.Price || ""}</p>
          <p>${product.Colors || ""}</p>
          <p>${product.Sizes || ""}</p>
        </div>
      `;

      list.appendChild(item);

    });

  } catch (error) {

    console.error(error);

    list.innerHTML = "<p>Could not load products.</p>";
  }
}


$("adminPanel").style.display = "none";
