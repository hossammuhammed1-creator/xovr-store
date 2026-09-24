const API_URL = "PUT_YOUR_APPS_SCRIPT_URL_HERE";

const $ = id => document.getElementById(id);

let mainImageFile = null;
let additionalImageFiles = [];


// =========================
// IMAGE SELECTION
// =========================

$("mainImage").addEventListener("change", e => {

  mainImageFile = e.target.files[0] || null;

  showPreview();

});


$("additionalImages").addEventListener("change", e => {

  additionalImageFiles = Array.from(e.target.files || []);

  showPreview();

});


// =========================
// IMAGE PREVIEW
// =========================

function showPreview() {

  const preview = $("imagePreview");

  preview.innerHTML = "";

  if (mainImageFile) {

    const title = document.createElement("p");
    title.textContent = "Main Image";
    preview.appendChild(title);

    const img = document.createElement("img");

    img.src = URL.createObjectURL(mainImageFile);

    img.style.width = "120px";
    img.style.height = "120px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "10px";
    img.style.margin = "5px";

    preview.appendChild(img);
  }


  if (additionalImageFiles.length) {

    const title = document.createElement("p");
    title.textContent = "Additional Images";
    preview.appendChild(title);

    additionalImageFiles.forEach(file => {

      const img = document.createElement("img");

      img.src = URL.createObjectURL(file);

      img.style.width = "100px";
      img.style.height = "100px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "10px";
      img.style.margin = "5px";

      preview.appendChild(img);

    });

  }

}


// =========================
// FILE → BASE64
// =========================

function fileToBase64(file) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = () => {

      const result = reader.result;

      const base64 = result.split(",")[1];

      resolve({
        name: file.name,
        type: file.type,
        data: base64
      });

    };

    reader.onerror = reject;

    reader.readAsDataURL(file);

  });

}


// =========================
// ADD PRODUCT
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
    status.textContent = "Please enter product price.";
    return;
  }

  if (!mainImageFile) {
    status.textContent = "Please choose a main image.";
    return;
  }


  status.textContent = "Preparing images...";


  try {

    const mainImage = await fileToBase64(mainImageFile);

    const additionalImages = [];

    for (const file of additionalImageFiles) {

      const image = await fileToBase64(file);

      additionalImages.push(image);

    }


    const product = {

      action: "addProduct",

      id: Date.now().toString(),

      name: name,

      price: Number(price),

      description: description,

      colors: colors,

      sizes: sizes,

      mainImage: mainImage,

      additionalImages: additionalImages

    };


    status.textContent = "Uploading product...";


    const response = await fetch(API_URL, {

      method: "POST",

      body: JSON.stringify(product)

    });


    const result = await response.json();


    if (!result.success) {

      throw new Error(
        result.message || "Something went wrong."
      );

    }


    status.textContent = "Product saved successfully!";


    // Reset form

    $("productName").value = "";
    $("productPrice").value = "";
    $("productDescription").value = "";
    $("productColors").value = "";
    $("productSizes").value = "";

    $("mainImage").value = "";
    $("additionalImages").value = "";

    $("imagePreview").innerHTML = "";

    mainImageFile = null;
    additionalImageFiles = [];


  } catch (error) {

    console.error(error);

    status.textContent =
      "Error: " + error.message;

  }

}


// =========================
// LOGIN
// =========================

function login() {

  const email = $("email").value.trim();
  const password = $("password").value.trim();

  /*
    هنربط نظام الدخول بعد ما نخلص
    Google Apps Script.
  */

  if (!email || !password) {

    $("loginMessage").textContent =
      "Enter email and password.";

    return;

  }

  // مؤقتًا
  $("loginBox").style.display = "none";
  $("adminPanel").style.display = "block";

}


// =========================
// LOGOUT
// =========================

function logout() {

  $("adminPanel").style.display = "none";
  $("loginBox").style.display = "block";

}


// =========================
// START
// =========================

$("adminPanel").style.display = "none";
