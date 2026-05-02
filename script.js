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
    },
    en: {
      search: "Search…",
      empty: "No items found.",
      vat: "Prices in euro. VAT included.",
      back: "Back",
      items: (n) => `${n} items`,
    },
  };

  // Icons from Lucide (lucide.dev) — MIT licensed, ISC original, hand-tuned
  const ICONS = {
    // lucide: coffee
    "coffees-beverages": `<svg viewBox="0 0 24 24"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>`,
    // teapot with spout + lid (Lucide doesn't ship a tea icon — drawn in matching stroke style)
    "tea": `<svg viewBox="0 0 24 24"><path d="M4 11h13v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4z"/><path d="M17 12h3a2 2 0 0 1 0 4h-3"/><path d="M10 8V6h3v2"/><path d="M11 4c-.5-.7-.5-1.3 0-2"/></svg>`,
    // lucide: martini-glass-citrus
    "cocktails": `<svg viewBox="0 0 24 24"><path d="M8 22h8"/><path d="M12 11v11"/><path d="m19 3-7 8-7-8Z"/><path d="M5.5 10h13"/></svg>`,
    // lucide: cup-soda
    "soft-drinks": `<svg viewBox="0 0 24 24"><path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"/><path d="M5 8h14"/><path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/><path d="m12 8 1-6h2"/></svg>`,
    // spirits bottle (no Lucide bottle icon — drawn in matching stroke style)
    "drinks": `<svg viewBox="0 0 24 24"><path d="M10 2h4v4"/><path d="M9 6h6c0 1 .5 1.5 1 2.5V20a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8.5C8.5 7.5 9 7 9 6z"/><rect x="9" y="11" width="6" height="5" rx="0.5"/></svg>`,
    // lucide: beer
    "beers": `<svg viewBox="0 0 24 24"><path d="M17 11h1a3 3 0 0 1 0 6h-1"/><path d="M9 12v6"/><path d="M13 12v6"/><path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5C9.44 3.5 10 3 12 3s2.56.5 3.5.5c.93 0 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z"/><path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"/></svg>`,
    // lucide: wine
    "wines": `<svg viewBox="0 0 24 24"><path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/></svg>`,
    // lucide: cookie
    "snacks": `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>`,
    // lucide: circle-help (default)
    "_default": `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
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
  const pickCatShortName = (c) => {
    if (STATE.lang === "en") return c.short_name_en || c.name_en || c.name;
    return c.short_name || c.name;
  };
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
  function pickTime(it) {
    return STATE.lang === "en" ? it.time_en || it.time || null : it.time || null;
  }

  function buildItemRow(it, useVariantTable = false) {
    const row = document.createElement("div");
    row.className = "item";

    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = pickName(it);
    const time = pickTime(it);
    if (time) {
      const t = document.createElement("span");
      t.className = "item-time";
      t.textContent = time;
      name.appendChild(document.createTextNode(" "));
      name.appendChild(t);
    }

    const price = document.createElement("span");
    price.className = "item-price";

    if (useVariantTable && Array.isArray(it.variants) && it.variants.length) {
      price.classList.add("item-price--cells");
      it.variants.forEach((v) => {
        const cell = document.createElement("span");
        cell.className = "variant-amount";
        cell.textContent = fmtPrice(v.price);
        price.appendChild(cell);
      });
    } else if (Array.isArray(it.variants) && it.variants.length) {
      price.classList.add("item-price--variants");
      it.variants.forEach((v) => {
        const line = document.createElement("span");
        line.className = "variant-line";
        const label = document.createElement("span");
        label.className = "variant-label";
        label.textContent = pickVariantLabel(v);
        const amount = document.createElement("span");
        amount.className = "variant-amount";
        amount.textContent = fmtPrice(v.price);
        line.append(label, amount);
        price.appendChild(line);
      });
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

    // Category title rendered as page heading, outside the section cards
    const pageTitle = document.createElement("h1");
    pageTitle.className = "page-title";
    pageTitle.textContent = pickCatName(cat);
    root.appendChild(pageTitle);

    const itemsHost = document.createElement("div");
    itemsHost.className = "section-stack";
    root.appendChild(itemsHost);

    function variantSignature(it) {
      if (!Array.isArray(it.variants) || !it.variants.length) return "";
      return it.variants.map((v) => v.label).join("|");
    }

    function groupBySection(items) {
      const groups = [];
      let cur = null;
      items.forEach((it) => {
        const sec = pickSection(it) || "";
        if (!cur || cur.sec !== sec) {
          cur = { sec, items: [] };
          groups.push(cur);
        }
        cur.items.push(it);
      });
      return groups;
    }

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
      const groups = groupBySection(filtered);
      groups.forEach((g) => {
        // detect uniform variants in this section (skip for beers — keep per-row labels)
        const sigs = new Set(g.items.map(variantSignature));
        const uniformVariant =
          cat.id !== "beers" && sigs.size === 1 && [...sigs][0] !== "";

        // Each section becomes its own card
        const card = document.createElement("section");
        card.className = "section-card";

        if (uniformVariant) {
          card.classList.add("section-card--variant");
          const sample = g.items[0].variants;
          card.style.setProperty("--cols", sample.length);
          const head = document.createElement("div");
          head.className = "variant-head";
          const title = document.createElement("span");
          title.className = "variant-head-title";
          title.textContent = g.sec || "";
          head.appendChild(title);
          sample.forEach((v) => {
            const lbl = document.createElement("span");
            lbl.className = "variant-head-label";
            lbl.textContent = pickVariantLabel(v);
            head.appendChild(lbl);
          });
          card.appendChild(head);
        } else if (g.sec) {
          const sh = document.createElement("h3");
          sh.className = "section-card-title";
          sh.textContent = g.sec;
          card.appendChild(sh);
        }

        g.items.forEach((it) => {
          card.appendChild(buildItemRow(it, uniformVariant));
        });
        itemsHost.appendChild(card);
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
