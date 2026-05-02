(() => {
  "use strict";

  const STATE = {
    lang: localStorage.getItem("kafeneon-lang") || "el",
    data: null,
    query: "",
  };

  const LABELS = {
    el: { search: "Αναζήτηση…", empty: "Δεν βρέθηκαν προϊόντα.", vat: "Τιμές σε ευρώ. Συμπεριλαμβάνεται ΦΠΑ." },
    en: { search: "Search…", empty: "No items found.", vat: "Prices in euro. VAT included." },
  };

  const fmtPrice = (n) =>
    new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(n);

  const pickName = (it) => (STATE.lang === "en" && it.name_en ? it.name_en : it.name);
  const pickDesc = (it) =>
    STATE.lang === "en" ? it.description_en || null : it.description || null;
  const pickSection = (it) =>
    STATE.lang === "en" ? it.section_en || it.section || null : it.section || null;
  const pickCatName = (c) => (STATE.lang === "en" && c.name_en ? c.name_en : c.name);
  const pickVariantLabel = (v) =>
    STATE.lang === "en" && v.label_en ? v.label_en : v.label;

  const $ = (sel) => document.querySelector(sel);

  function renderNav() {
    const nav = $("#cat-nav");
    nav.innerHTML = "";
    STATE.data.categories.forEach((c, i) => {
      const a = document.createElement("a");
      a.href = `#${c.id}`;
      a.className = "cat-chip" + (i === 0 ? " active" : "");
      a.textContent = pickCatName(c);
      a.dataset.cat = c.id;
      nav.appendChild(a);
    });
  }

  function itemMatches(it, q) {
    if (!q) return true;
    const fields = [it.name, it.name_en, it.description, it.description_en, it.section, it.section_en];
    return fields.some((f) => f && f.toLowerCase().includes(q));
  }

  function buildItemRow(it) {
    const row = document.createElement("div");
    row.className = "item";

    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = pickName(it);

    const price = document.createElement("span");
    price.className = "item-price";
    price.textContent = fmtPrice(it.price);

    row.append(name, price);

    const desc = pickDesc(it);
    if (desc) {
      const d = document.createElement("p");
      d.className = "item-desc";
      d.textContent = desc;
      row.appendChild(d);
    }

    if (Array.isArray(it.variants) && it.variants.length) {
      const wrap = document.createElement("div");
      wrap.className = "item-variants";
      it.variants.forEach((v) => {
        const span = document.createElement("span");
        span.className = "variant";
        const label = document.createTextNode(pickVariantLabel(v) + " · ");
        const strong = document.createElement("strong");
        strong.textContent = fmtPrice(v.price);
        span.append(label, strong);
        wrap.appendChild(span);
      });
      row.appendChild(wrap);
    }

    return row;
  }

  function renderMenu() {
    const root = $("#menu");
    root.innerHTML = "";
    const q = STATE.query.trim().toLowerCase();
    let anyVisible = false;

    STATE.data.categories.forEach((cat) => {
      const visibleItems = cat.items.filter((it) => itemMatches(it, q));
      if (!visibleItems.length) return;

      const section = document.createElement("section");
      section.className = "cat";
      section.id = cat.id;

      const h = document.createElement("h2");
      h.className = "cat-title";
      h.textContent = pickCatName(cat);
      section.appendChild(h);

      let lastSection = null;
      visibleItems.forEach((it) => {
        const sec = pickSection(it);
        if (sec && sec !== lastSection) {
          const sh = document.createElement("h3");
          sh.className = "section-title";
          sh.textContent = sec;
          section.appendChild(sh);
          lastSection = sec;
        } else if (!sec) {
          lastSection = null;
        }
        section.appendChild(buildItemRow(it));
      });

      root.appendChild(section);
      anyVisible = true;
    });

    if (!anyVisible) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = LABELS[STATE.lang].empty;
      root.appendChild(empty);
    }
  }

  function applyLanguage() {
    document.documentElement.lang = STATE.lang;
    document.querySelectorAll(".lang-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === STATE.lang);
    });
    $("#search").placeholder = LABELS[STATE.lang].search;
    $(".foot-sm").textContent = LABELS[STATE.lang].vat;
    if (STATE.data) {
      const tag = STATE.data.shop.tagline || "";
      $("#tagline").textContent = tag;
      const addr = STATE.data.shop.address || "";
      $("#address").textContent = addr;
      renderNav();
      renderMenu();
    }
  }

  function bindEvents() {
    document.querySelectorAll(".lang-btn").forEach((b) => {
      b.addEventListener("click", () => {
        STATE.lang = b.dataset.lang;
        localStorage.setItem("kafeneon-lang", STATE.lang);
        applyLanguage();
      });
    });

    $("#search").addEventListener("input", (e) => {
      STATE.query = e.target.value;
      renderMenu();
    });

    document.addEventListener("click", (e) => {
      const chip = e.target.closest(".cat-chip");
      if (!chip) return;
      document.querySelectorAll(".cat-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
    });
  }

  async function loadData() {
    try {
      const res = await fetch("menu.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data || !Array.isArray(data.categories)) {
        throw new Error("Invalid menu.json shape");
      }
      return data;
    } catch (err) {
      console.error("Failed to load menu.json", err);
      const root = $("#menu");
      root.innerHTML = `<p class="empty">⚠️ Could not load menu. Please refresh.</p>`;
      return null;
    }
  }

  async function init() {
    bindEvents();
    const data = await loadData();
    if (!data) return;
    STATE.data = data;
    if (data.shop && data.shop.name) {
      const sub = data.shop.subtitle ? ` ${data.shop.subtitle}` : "";
      document.title = `${data.shop.name}${sub} — Menu`;
    }
    applyLanguage();
  }

  init();
})();
