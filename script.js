/* ===== CONFIGURAÇÃO (edite aqui) ===== */
const CONFIG = {
  brand: "AVW Lanches",                 // nome provisório
  whatsapp: "5511900000000",            // FICTÍCIO: troque pelo real (DDI+DDD+número)
  whatsappShow: "(11) 90000-0000",
  hours: "Ter a Dom, 18h às 23h (horário de exemplo)",
  // Fotos: images/<id>.jpg (ex.: images/xburger.jpg). Sem foto, o card mostra a textura da marca.
  // PREÇOS E DESCRIÇÕES FICTÍCIOS: troque pelos reais.
  items: [
    { id: "xburger",  cat: "lanches", name: "X-Burger",      desc: "Hambúrguer, queijo, alface, tomate e molho da casa.", price: 24 },
    { id: "xbacon",   cat: "lanches", name: "X-Bacon",       desc: "Hambúrguer, queijo, bacon crocante e maionese.", price: 28 },
    { id: "xfrango",  cat: "lanches", name: "X-Frango",      desc: "Filé de frango empanado, queijo, alface e molho.", price: 26 },
    { id: "duplo",    cat: "lanches", name: "Duplo Cheddar", desc: "Dois hambúrgueres, cheddar cremoso e cebola caramelizada.", price: 34 },
    { id: "margherita", cat: "pizzas", name: "Margherita",   desc: "Molho de tomate, muçarela, tomate e manjericão.", sizes: [["Média", 42], ["Grande", 56]] },
    { id: "calabresa",  cat: "pizzas", name: "Calabresa",    desc: "Calabresa fatiada, cebola e muçarela.", sizes: [["Média", 44], ["Grande", 58]] },
    { id: "frango",     cat: "pizzas", name: "Frango com catupiry", desc: "Frango desfiado, catupiry e muçarela.", sizes: [["Média", 46], ["Grande", 60]] },
    { id: "portuguesa", cat: "pizzas", name: "Portuguesa",   desc: "Presunto, ovo, cebola, azeitona e muçarela.", sizes: [["Média", 48], ["Grande", 62]] },
    { id: "refri", cat: "bebidas", name: "Refrigerante lata", price: 6 },
    { id: "suco",  cat: "bebidas", name: "Suco natural",      price: 9 },
  ],
  cats: { lanches: "Lanches", pizzas: "Pizzas", bebidas: "Bebidas" },
};

const $ = (s) => document.querySelector(s);
const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const KEY = "avw_lanches_bag";
let bag = {};
try { bag = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { bag = {}; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch {} };

/* ===== CARDÁPIO ===== */
function priceOf(it, size) { return it.sizes ? it.sizes.find(s => s[0] === size)[1] : it.price; }
function itemHTML(it) {
  if (it.cat === "bebidas")
    return `<li class="drink"><h4>${it.name}</h4><div><span class="price">${brl(it.price)}</span><button type="button" class="add" data-add="${it.id}" aria-label="Adicionar ${it.name}">Adicionar</button></div></li>`;
  const buy = it.sizes
    ? `<div class="sizes">${it.sizes.map(([n, p]) => `<button type="button" class="add" data-add="${it.id}" data-size="${n}" aria-label="Adicionar ${it.name} ${n}, ${brl(p)}">${n}<small>${brl(p)}</small></button>`).join("")}</div>`
    : `<span class="price">${brl(it.price)}</span><button type="button" class="add" data-add="${it.id}" aria-label="Adicionar ${it.name}">Adicionar</button>`;
  return `<li class="item${it.cat === "lanches" ? " item--zoom" : ""}"><div class="item__img"><img src="images/${it.id}.jpg" alt="${it.name}" loading="lazy" onerror="this.remove()"></div>
    <div class="item__b"><h4>${it.name}</h4><p>${it.desc}</p><div class="item__buy">${buy}</div></div></li>`;
}
$("#menuList").innerHTML = Object.keys(CONFIG.cats).map(c => {
  const list = CONFIG.items.filter(i => i.cat === c).map(itemHTML).join("");
  return `<section class="cat" id="cat-${c}"><h3 class="display">${CONFIG.cats[c]}</h3><ul class="${c === "bebidas" ? "drinks" : "grid"}">${list}</ul></section>`;
}).join("");
$("#hours").textContent = CONFIG.hours;
$("#waShow").textContent = "WhatsApp " + CONFIG.whatsappShow;
$("#waBig").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Olá! Gostaria de fazer um pedido.")}`;
$("#waBig").target = "_blank"; $("#waBig").rel = "noopener";

/* ===== SACOLA ===== */
function lines() {
  return Object.entries(bag).map(([k, qty]) => {
    const [id, size] = k.split("|"); const it = CONFIG.items.find(i => i.id === id);
    if (!it) return null; const unit = priceOf(it, size);
    return { k, name: it.name, size, qty, unit, total: unit * qty };
  }).filter(Boolean);
}
const subtotal = () => lines().reduce((s, l) => s + l.total, 0);
const count = () => lines().reduce((s, l) => s + l.qty, 0);

function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 1600); }

function renderBag() {
  const L = lines(), n = count(), sub = subtotal();
  $("#bagCount").textContent = n;
  $("#barBtn").textContent = n ? `Ver sacola · ${n} ${n > 1 ? "itens" : "item"} · ${brl(sub)}` : "Ver cardápio";
  $("#lines").innerHTML = L.map(l => `<li><div><b>${l.name}</b>${l.size ? `<small>${l.size}</small>` : ""}</div><span class="lsum">${brl(l.total)}</span>
    <div class="qty"><button type="button" data-dec="${l.k}" aria-label="Diminuir ${l.name}">−</button><span aria-live="polite">${l.qty}</span><button type="button" data-inc="${l.k}" aria-label="Aumentar ${l.name}">+</button></div></li>`).join("");
  $("#empty").hidden = n > 0; $("#form").hidden = n === 0; $("#send").disabled = n === 0;
  $("#sub").textContent = brl(sub);
}
function add(id, size) { const k = id + "|" + (size || ""); bag[k] = (bag[k] || 0) + 1; save(); renderBag(); const it = CONFIG.items.find(i => i.id === id); toast(`${it.name}${size ? " (" + size + ")" : ""} adicionado`); }

document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-add]"); if (a) return add(a.dataset.add, a.dataset.size);
  const inc = e.target.closest("[data-inc]"); if (inc) { bag[inc.dataset.inc]++; save(); return renderBag(); }
  const dec = e.target.closest("[data-dec]"); if (dec) { const k = dec.dataset.dec; if (--bag[k] <= 0) delete bag[k]; save(); return renderBag(); }
  if (e.target.closest("[data-close]")) closeBag();
});

let opener = null;
function openBag() { opener = document.activeElement; $("#bag").hidden = false; document.body.style.overflow = "hidden"; $("#bagClose").focus(); }
function closeBag() { $("#bag").hidden = true; document.body.style.overflow = ""; if (opener) opener.focus(); }
$("#bagBtn").addEventListener("click", openBag);
$("#barBtn").addEventListener("click", () => count() ? openBag() : $("#cardapio").scrollIntoView());
$("#clear").addEventListener("click", () => { bag = {}; save(); renderBag(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeBag(); setMenu(false); } });

/* entrega x retirada */
const mode = () => document.querySelector('input[name="mode"]:checked').value;
document.querySelectorAll('input[name="mode"]').forEach(r => r.addEventListener("change", () => {
  $("#addrBox").hidden = mode() === "retirada"; $("#feeNote").hidden = mode() === "retirada";
}));

/* envio */
function say(html, err) { const m = $("#msg"); m.className = "msg" + (err ? " err" : ""); m.innerHTML = html; }
$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#name").value.trim(), addr = $("#addr").value.trim(), entrega = mode() === "entrega";
  if (!count()) return say("Adicione itens à sacola.", true);
  if (name.length < 2) return say("Informe seu nome.", true);
  if (entrega && addr.length < 5) return say("Informe o endereço de entrega.", true);
  const obs = $("#obs").value.trim();
  const text = [
    `*Novo pedido — ${CONFIG.brand}*`, "",
    ...lines().map(l => `${l.qty}x ${l.name}${l.size ? ` (${l.size})` : ""} — ${brl(l.total)}`), "",
    `Subtotal: ${brl(subtotal())}`, entrega ? "Taxa de entrega: a confirmar" : "Retirada no balcão", "",
    `Nome: ${name}`, entrega ? `Endereço: ${addr}` : null, `Pagamento: ${$("#pay").value}`, obs ? `Obs: ${obs}` : null,
  ].filter(x => x !== null).join("\n");
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
  say(`Pedido pronto! Envie no WhatsApp para confirmar. <a href="${url}" target="_blank" rel="noopener">Abrir WhatsApp</a>`);
  window.open(url, "_blank", "noopener");
});

/* menu mobile */
const menuBtn = $("#menuBtn"), menu = $("#menu");
function setMenu(open) { menu.hidden = !open; menuBtn.setAttribute("aria-expanded", open); menuBtn.textContent = open ? "Fechar" : "Menu"; document.body.style.overflow = open ? "hidden" : ""; }
menuBtn.addEventListener("click", () => setMenu(menu.hidden));
menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
window.matchMedia("(min-width:768px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

renderBag();
