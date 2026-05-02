(() => {
  "use strict";

  const STATE = {
    lang: localStorage.getItem("kafeneon-lang") || "el",
    data: null,
    query: "",
  };

  const LABELS = {
    el: {
      search: "Αναζήτηση…",
      empty: "Δεν βρέθηκαν προϊόντα.",
      vat: "Τιμές σε ευρώ. Συμπεριλαμβάνεται ΦΠΑ.",
      back: "Πίσω",
      items: (n) => `${n} προϊόντα`,
      from: "από",
    },
    en: {
      search: "Search…",
      empty: "No items found.",
      vat: "Prices in euro. VAT included.",
      back: "Back",
      items: (n) => `${n} items`,
      from: "from",
    },
  };

  const ICONS = {
    "coffees-beverages": `<svg viewBox="0 0 24 24"><path d="M4 8h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z"/><path d="M16 9h2a3 3 0 0 1 0 6h-2"/><path d="M8 3v2M11 3v2M14 3v2"/></svg>`,
    "tea": `<svg viewBox="0 0 24 24"><path d="M5 9h12v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z"/><path d="M17 10.5h2a2.5 2.5 0 0 1 0 5h-2"/><path d="M9 6c0-1 1-2 1-3M12 6c0-1 1-2 1-3"/></svg>`,
    "cocktails": `<svg viewBox="0 0 24 24"><path d="M4 5h16l-7 8v6"/><path d="M9 19h8"/><circle cx="17" cy="6.5" r="1"/></svg>`,
    "soft-drinks": `<svg viewBox="0 0 24 24"><path d="M7 4h10l-1 16a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2L7 4z"/><path d="M7 8h10"/><path d="M11 12v6"/></svg>`,
    "drinks": `<svg viewBox="0 0 24 24"><path d="M9 3h6v3l1 2v9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8l1-2V3z"/><path d="M9 12h6"/></svg>`,
    "beers": `<svg viewBox="0 0 24 24"><path d="M5 7h11v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7z"/><path d="M16 9h2a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-2"/><path d="M8 11v8M11 11v8"/></svg>`,
    "wines": `<svg viewBox="0 0 24 24"><path d="M7 3h10v4a5 5 0 0 1-10 0V3z"/><path d="M12 12v7"/><path d="M8 21h8"/></svg>`,
    "snacks": `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="0.8" fill="currentColor"/><circle cx="14" cy="9" r="0.8" fill="currentColor"/><circle cx="15" cy="14" r="0.8" fill="currentColor"/><circle cx="10" cy="15" r="0.8" fill="currentColor"/></svg>`,
    "_default": `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>`,
  };

  const fmtPrice = (n) =>
    new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(n);

  const t = () => LABELS[STATE.lang];
  const pickName = (it) => (STATE.lang === "en" && it.name_en ? it.name_en : it.name);
  const pickDesc = (it) =>
    STATE.lang === "en" ? it.description_en || null : it.description || null;
  const pickSection = (it) =>
    STATE.lang === "en" ? it.section_en || it.section || null : it.section || null;
  const pickCatName = (c) => (STATE.lang === "en" && c.name_en ? c.name_en : c.name);
  const pickVariantLabel = (v) => (STATE.lang === "en" && v.label_en ? v.label_en : v.label);

  const $ = (sel) => document.querySelector(sel);

  // ---- Routing (hash-based) ----
  function currentRoute() {
    const h = (location.hash || "").replace(/^#/, "");
    if (!h) return { name: "home" };
    return { name: "category", id: h };
  }

  function navigate(hash) {
    if (hash) {
      location.hash = hash;
    } else {
      history.pushState("", document.title, location.pathname + location.search);
    }
    render();
  }

  // ---- Renderers ----
  function buildItemRow(it) {
    const row = document.createElement("div");
    row.className = "item";

    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = pickName(it);

    const price = document.createElement("span");
    price.className = "item-price";
    if (it.price_from) {
      price.textContent = `${t().from} ${fmtPrice(it.price)}`;
    } else {
      price.textContent = fmtPrice(it.price);
    }

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
        span.append(document.createTextNode(pickVariantLabel(v) + " · "));
        const strong = document.createElement("strong");
        strong.textContent = fmtPrice(v.price);
        span.appendChild(strong);
        wrap.appendChild(span);
      });
      row.appendChild(wrap);
    }

    return row;
  }

  function renderHome() {
    const root = $("#app");
    root.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "cat-grid";

    STATE.data.categories.forEach((c) => {
      const a = document.createElement("a");
      a.className = "cat-tile";
      a.href = `#${c.id}`;
      a.setAttribute("aria-label", pickCatName(c));

      const iconWrap = document.createElement("div");
      iconWrap.className = "cat-tile-icon";
      iconWrap.innerHTML = ICONS[c.id] || ICONS._default;

      const name = document.createElement("div");
      name.className = "cat-tile-name";
      name.textContent = pickCatName(c);

      const count = document.createElement("div");
      count.className = "cat-tile-count";
      count.textContent = t().items(c.items.length);

      a.append(iconWrap, name, count);
      grid.appendChild(a);
    });

    root.appendChild(grid);
  }

  function renderCategory(id) {
    const cat = STATE.data.categories.find((c) => c.id === id);
    if (!cat) {
      navigate("");
      return;
    }

    const root = $("#app");
    root.innerHTML = "";

    // top bar with back + search
    const bar = document.createElement("div");
    bar.className = "detail-bar";

    const back = document.createElement("button");
    back.type = "button";
    back.className = "back-btn";
    back.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg> <span>${t().back}</span>`;
    back.addEventListener("click", () => navigate(""));

    const searchWrap = document.createElement("div");
    searchWrap.className = "detail-search";
    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = t().search;
    search.value = STATE.query;
    search.addEventListener("input", (e) => {
      STATE.query = e.target.value;
      drawItems();
    });
    searchWrap.appendChild(search);

    bar.append(back, searchWrap);
    root.appendChild(bar);

    const section = document.createElement("section");
    section.className = "cat";
    const h = document.createElement("h2");
    h.className = "cat-title";
    h.textContent = pickCatName(cat);
    section.appendChild(h);

    const itemsHost = document.createElement("div");
    section.appendChild(itemsHost);
    root.appendChild(section);

    function drawItems() {
      itemsHost.innerHTML = "";
      const q = STATE.query.trim().toLowerCase();
      const filtered = cat.items.filter((it) => {
        if (!q) return true;
        const fields = [it.name, it.name_en, it.description, it.description_en, it.section, it.section_en];
        return fields.some((f) => f && f.toLowerCase().includes(q));
      });
      if (!filtered.length) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = t().empty;
        itemsHost.appendChild(empty);
        return;
      }
      let lastSec = null;
      filtered.forEach((it) => {
        const sec = pickSection(it);
        if (sec && sec !== lastSec) {
          const sh = document.createElement("h3");
          sh.className = "section-title";
          sh.textContent = sec;
          itemsHost.appendChild(sh);
          lastSec = sec;
        } else if (!sec) {
          lastSec = null;
        }
        itemsHost.appendChild(buildItemRow(it));
      });
    }

    drawItems();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function render() {
    const route = currentRoute();
    if (route.name === "home") {
      STATE.query = "";
      renderHome();
    } else {
      renderCategory(route.id);
    }
  }

  // ---- Language ----
  function applyLanguage() {
    document.documentElement.lang = STATE.lang;
    $("#lang-current").textContent = STATE.lang.toUpperCase();
    document.querySelectorAll(".lang-menu li").forEach((li) => {
      li.classList.toggle("active", li.dataset.lang === STATE.lang);
    });
    if (STATE.data) {
      $("#address").textContent = STATE.data.shop.address || "";
      $(".foot-sm").textContent = t().vat;
      render();
    }
  }

  function bindLangMenu() {
    const toggle = $("#lang-toggle");
    const menu = $("#lang-menu");

    const close = () => {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    };
    const open = () => {
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
    };

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (menu.hidden) open();
      else close();
    });

    menu.querySelectorAll("li").forEach((li) => {
      const choose = () => {
        STATE.lang = li.dataset.lang;
        localStorage.setItem("kafeneon-lang", STATE.lang);
        close();
        applyLanguage();
      };
      li.addEventListener("click", choose);
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          choose();
        }
      });
    });

    document.addEventListener("click", (e) => {
      if (!menu.hidden && !e.target.closest(".lang-wrap")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) close();
    });
  }

  // ---- Boot ----
  async function loadData() {
    try {
      const res = await fetch("menu.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data || !Array.isArray(data.categories)) throw new Error("Invalid menu.json");
      return data;
    } catch (err) {
      console.error("Failed to load menu.json", err);
      $("#app").innerHTML = `<p class="empty">⚠️ Could not load menu. Please refresh.</p>`;
      return null;
    }
  }

  async function init() {
    bindLangMenu();
    window.addEventListener("hashchange", render);
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
