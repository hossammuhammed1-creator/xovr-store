const SUPABASE_URL = "https://eumcldmkvkcacsaybnxf.supabase.co";
const SUPABASE_KEY = "sb_publishable_BnPkZg1Hm8e0IVLYAZto-A_prOtX1aC";

const $ = (id) => document.getElementById(id);

let selectedImage = null;

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
  const email = $("email").value.trim();
  const password = $("password").value.trim();

  if (!email || !password) {
    $("loginMessage").textContent =
      "Enter email and password.";
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
  const description =
    $("productDescription").value.trim();
  const colors =
    $("productColors").value.trim();
  const sizes =
    $("productSizes").value.trim();

  const status = $("status");

  if (!name) {
    status.textContent = "Please enter product name.";
    return;
  }

  if (!price) {
    status.textContent = "Please enter price.";
    return;
  }

  if (!selectedImage) {
    status.textContent = "Please choose an image.";
    return;
  }

  try {

    status.textContent = "Uploading image...";

    // =========================
    // 1. UPLOAD IMAGE
    // =========================

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


    // =========================
    // 2. IMAGE URL
    // =========================

    const imageUrl =
      `${SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;


    // =========================
    // 3. SAVE PRODUCT
    // =========================

    status.textContent = "Saving product...";

    const productResponse = await fetch(
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


    if (!productResponse.ok) {

      const errorText =
        await productResponse.text();

      throw new Error(
        "Product save failed: " + errorText
      );
    }


    // =========================
    // 4. SUCCESS
    // =========================

    status.textContent =
      "Product added successfully!";


    $("productName").value = "";
    $("productPrice").value = "";
    $("productDescription").value = "";
    $("productColors").value = "";
    $("productSizes").value = "";
    $("mainImage").value = "";

    selectedImage = null;

    loadProducts();

  }

  catch (error) {

    console.error(error);

    status.textContent =
      "Error: " + error.message;
  }
}


// =========================
// LOAD PRODUCTS
// =========================

async function loadProducts() {

  const list = $("productsList");

  list.innerHTML = "Loading products...";

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
          style="width:100px;height:100px;object-fit:cover"
        >

        <div>

          <h3>
            ${product.name || ""}
          </h3>

          <p>
            ${product.price || ""}
          </p>

          <p>
            ${product.colors || ""}
          </p>

          <p>
            ${product.sizes || ""}
          </p>

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
// INITIAL STATE
// =========================

$("adminPanel").style.display = "none";
