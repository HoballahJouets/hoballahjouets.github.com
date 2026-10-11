import { t, applyStaticI18n } from "./i18n.js";

const state = {
  locale: "fr",
  config: null,
  catalog: null,
  category: "all",
  activeProductId: null,
};

const els = {
  rail: document.getElementById("category-rail"),
  grid: document.getElementById("product-grid"),
  count: document.getElementById("catalog-count"),
  overlay: document.getElementById("detail-overlay"),
  panel: document.querySelector(".detail-panel"),
  detailImage: document.getElementById("detail-image"),
  detailTitle: document.getElementById("detail-title"),
  detailDesc: document.getElementById("detail-desc"),
  detailMeta: document.getElementById("detail-meta"),
  detailWhatsapp: document.getElementById("detail-whatsapp"),
  detailEmail: document.getElementById("detail-email"),
  contactWhatsapp: document.getElementById("contact-whatsapp"),
  contactEmail: document.getElementById("contact-email"),
  langBtns: document.querySelectorAll(".lang-btn"),
};

function localized(field) {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[state.locale] || field.fr || field.en || "";
}

function whatsappDigits(raw) {
  return String(raw || "").replace(/\D/g, "");
}

function whatsappUrl(message) {
  const phone = whatsappDigits(state.config?.contact?.whatsapp);
  const text = encodeURIComponent(message);
  return phone
    ? `https://wa.me/${phone}?text=${text}`
    : `https://wa.me/?text=${text}`;
}

function mailtoUrl(subject, body) {
  const email = state.config?.contact?.email || "";
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function setLocale(locale) {
  state.locale = locale === "en" ? "en" : "fr";
  localStorage.setItem("hoballah-locale", state.locale);
  applyStaticI18n(state.locale);
  els.langBtns.forEach((btn) => {
    const active = btn.dataset.lang === state.locale;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
  renderCategories();
  renderGrid();
  updateContactLinks();
  if (state.activeProductId) {
    const product = state.catalog.products.find((p) => p.id === state.activeProductId);
    if (product) fillDetail(product);
  }
}

function updateContactLinks() {
  const greet =
    state.locale === "fr"
      ? "Bonjour, je souhaite des informations sur le catalogue HoballaH jouets."
      : "Hello, I’d like information about the HoballaH jouets catalogue.";
  els.contactWhatsapp.href = whatsappUrl(greet);
  els.contactEmail.href = mailtoUrl(
    state.locale === "fr" ? "Demande catalogue HoballaH jouets" : "HoballaH jouets catalogue inquiry",
    greet
  );
}

function parseHash() {
  const hash = location.hash.replace(/^#/, "");
  if (!hash) return;
  if (hash.startsWith("product/")) {
    const id = hash.slice("product/".length);
    openDetail(id, false);
    return;
  }
  if (hash.startsWith("category/")) {
    state.category = hash.slice("category/".length) || "all";
    renderCategories();
    renderGrid();
  }
}

function setHash(value) {
  const next = value ? `#${value}` : "#catalogue";
  if (location.hash !== next) {
    history.replaceState(null, "", next);
  }
}

function renderCategories() {
  if (!state.catalog) return;
  const chips = [
    { slug: "all", name: { fr: t("fr", "catalog.all"), en: t("en", "catalog.all") } },
    ...state.catalog.categories,
  ];

  els.rail.innerHTML = chips
    .map((cat) => {
      const active = state.category === cat.slug;
      return `<button type="button" class="category-chip${active ? " is-active" : ""}" role="tab" aria-selected="${active}" data-category="${cat.slug}">${localized(cat.name)}</button>`;
    })
    .join("");
}

function filteredProducts() {
  const products = state.catalog?.products || [];
  if (state.category === "all") return products;
  return products.filter((p) => p.category === state.category);
}

function renderGrid() {
  const products = filteredProducts();
  els.count.textContent = t(state.locale, "catalog.count", { n: products.length });

  if (!products.length) {
    els.grid.innerHTML = `<p class="section-lede">${t(state.locale, "catalog.empty")}</p>`;
    return;
  }

  els.grid.innerHTML = products
    .map((product, index) => {
      const name = localized(product.name);
      const age = localized(product.age);
      const delay = Math.min(index, 8) * 0.04;
      return `
        <button type="button" class="product-card" data-product-id="${product.id}" style="animation-delay:${delay}s">
          <div class="product-photo">
            <img src="${product.image}" alt="${escapeAttr(name)}" loading="lazy" width="720" height="720" />
          </div>
          <h3 class="product-name">${escapeHtml(name)}</h3>
          ${age ? `<p class="product-age">${escapeHtml(age)}</p>` : ""}
        </button>`;
    })
    .join("");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("'", "&#39;");
}

function fillDetail(product) {
  const name = localized(product.name);
  const desc = localized(product.description);
  const age = localized(product.age);
  const category = state.catalog.categories.find((c) => c.slug === product.category);
  const catName = category ? localized(category.name) : "";

  els.detailImage.src = product.image;
  els.detailImage.alt = name;
  els.detailTitle.textContent = name;
  els.detailDesc.textContent = desc;
  const metaParts = [];
  if (catName) metaParts.push(catName);
  else if (age) metaParts.push(age);
  metaParts.push(`n° ${product.number}`);
  els.detailMeta.textContent = metaParts.join(" · ");

  const waMsg = t(state.locale, "inquire.whatsapp", { name, number: product.number });
  const subject = t(state.locale, "inquire.emailSubject", { name, number: product.number });
  const body = t(state.locale, "inquire.emailBody", { name, number: product.number });
  els.detailWhatsapp.href = whatsappUrl(waMsg);
  els.detailEmail.href = mailtoUrl(subject, body);
}

function openDetail(id, updateHash = true) {
  const product = state.catalog.products.find((p) => p.id === id);
  if (!product) return;
  state.activeProductId = id;
  fillDetail(product);
  els.overlay.hidden = false;
  document.body.style.overflow = "hidden";
  els.panel.focus({ preventScroll: true });
  if (updateHash) setHash(`product/${id}`);
}

function closeDetail(updateHash = true) {
  state.activeProductId = null;
  els.overlay.hidden = true;
  document.body.style.overflow = "";
  if (updateHash) {
    setHash(state.category === "all" ? "catalogue" : `category/${state.category}`);
  }
}

function bindEvents() {
  els.langBtns.forEach((btn) => {
    btn.addEventListener("click", () => setLocale(btn.dataset.lang));
  });

  els.rail.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-category]");
    if (!chip) return;
    state.category = chip.dataset.category;
    renderCategories();
    renderGrid();
    setHash(state.category === "all" ? "catalogue" : `category/${state.category}`);
  });

  els.grid.addEventListener("click", (e) => {
    const card = e.target.closest("[data-product-id]");
    if (!card) return;
    openDetail(card.dataset.productId);
  });

  els.overlay.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-detail]")) closeDetail();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.overlay.hidden) closeDetail();
  });

  window.addEventListener("hashchange", parseHash);
}

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

async function init() {
  const saved = localStorage.getItem("hoballah-locale");
  const [config, catalog] = await Promise.all([
    loadJson("data/config.json"),
    loadJson("data/products.json"),
  ]);

  state.config = config;
  state.catalog = catalog;
  state.locale = saved || config.defaultLocale || "fr";

  bindEvents();
  setLocale(state.locale);
  parseHash();
}

init().catch((err) => {
  console.error(err);
  document.getElementById("product-grid").innerHTML =
    "<p class=\"section-lede\">Unable to load catalogue.</p>";
});
