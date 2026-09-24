const KEY="xovr_products_v1", SETTINGS="xovr_settings_v1";
const demo=[
{id:"1",name:"Essential Tee",price:850,image:"assets/logo.jpeg",description:"A clean everyday silhouette built for the XOVR identity.",colors:["Black","White"],sizes:["S","M","L","XL"]},
{id:"2",name:"Oversized Tee",price:950,image:"assets/logo.jpeg",description:"Relaxed fit with a minimal, bold presence.",colors:["Black","White"],sizes:["M","L","XL","XXL"]},
{id:"3",name:"Signature Hoodie",price:1450,image:"assets/logo.jpeg",description:"Heavyweight feel and a sharp monochrome finish.",colors:["Black"],sizes:["M","L","XL","XXL"]}];
const $=id=>document.getElementById(id);
function products(){try{const x=JSON.parse(localStorage.getItem(KEY));return Array.isArray(x)&&x.length?x:demo}catch(e){return demo}}
function save(x){localStorage.setItem(KEY,JSON.stringify(x))}
function render(){
 const ps=products(); $("productCount").textContent=`${ps.length} product${ps.length===1?"":"s"}`;
 $("adminProducts").innerHTML=ps.map(p=>`<div class="admin-product"><img src="${p.image||"assets/logo.jpeg"}"><div><strong>${p.name}</strong><small>${Number(p.price).toLocaleString()} EGP · ${(p.sizes||[]).join(", ")}</small></div><div class="admin-actions"><button class="mini-btn" onclick="editProduct('${p.id}')">EDIT</button><button class="mini-btn" onclick="deleteProduct('${p.id}')">DELETE</button></div></div>`).join("");
}
function editProduct(id){
 const p=products().find(x=>String(x.id)===String(id));if(!p)return;
 $("productId").value=p.id;$("name").value=p.name;$("price").value=p.price;$("image").value=p.image||"";$("description").value=p.description||"";$("colors").value=(p.colors||[]).join(", ");$("sizes").value=(p.sizes||[]).join(", ");scrollTo({top:0,behavior:"smooth"});
}
function deleteProduct(id){if(!confirm("Delete this product?"))return;save(products().filter(p=>String(p.id)!==String(id)));render()}
$("productForm").addEventListener("submit",e=>{
 e.preventDefault();const id=$("productId").value||Date.now().toString();const ps=products();
 const p={id,name:$("name").value.trim(),price:Number($("price").value),image:$("image").value.trim()||"assets/logo.jpeg",description:$("description").value.trim(),colors:$("colors").value.split(",").map(x=>x.trim()).filter(Boolean),sizes:$("sizes").value.split(",").map(x=>x.trim()).filter(Boolean)};
 const i=ps.findIndex(x=>String(x.id)===String(id)); if(i>=0)ps[i]=p;else ps.push(p);save(ps);e.target.reset();$("productId").value="";render();alert("Saved.");
});
$("cancelEdit").onclick=()=>{$("productForm").reset();$("productId").value=""};
$("resetDemo").onclick=()=>{if(confirm("Reset all demo data?")){localStorage.removeItem(KEY);render()}};
const settings=JSON.parse(localStorage.getItem(SETTINGS)||'{"slogan":"Beyond Ordinary","email":"hello@xovr.com"}');$("slogan").value=settings.slogan;$("email").value=settings.email;
$("settingsForm").addEventListener("submit",e=>{e.preventDefault();localStorage.setItem(SETTINGS,JSON.stringify({slogan:$("slogan").value,email:$("email").value}));alert("Settings saved.")});
render();
