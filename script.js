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

  const ICONS = {
    // Coffee mug with handle + steam — universal "coffee" symbol
    "coffees-beverages": `<svg viewBox="0 0 24 24"><path d="M4 10h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6z"/><path d="M17 11h2.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 6c-1 1-1 2 0 3M11.5 6c-1 1-1 2 0 3M15 6c-1 1-1 2 0 3"/></svg>`,
    // Teapot with spout, lid handle, steam
    "tea": `<svg viewBox="0 0 24 24"><path d="M5 13c0-3 2.5-5 5.5-5h3c3 0 5.5 2 5.5 5v2a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-2z"/><path d="M19 13l3-1.5"/><path d="M11 8V6.5h2V8"/><path d="M9 4.5c-.5-.7-.5-1.3 0-2"/><path d="M13 4.5c-.5-.7-.5-1.3 0-2"/></svg>`,
    // Martini glass with olive on a pick
    "cocktails": `<svg viewBox="0 0 24 24"><path d="M3.5 5h17l-8.5 9v6"/><path d="M8 20h8"/><path d="M16.5 4.5l-2.5 2.5"/><circle cx="14" cy="7" r="1.1" fill="currentColor"/></svg>`,
    // Takeaway cup with lid + straw (soft drinks / smoothies)
    "soft-drinks": `<svg viewBox="0 0 24 24"><path d="M6.5 7h11l-1.2 13.2A2 2 0 0 1 14.3 22H9.7a2 2 0 0 1-2-1.8L6.5 7z"/><path d="M5.5 7h13l-.3-2H5.8z"/><path d="M13 4l-1 18"/></svg>`,
    // Spirits bottle with neck + label
    "drinks": `<svg viewBox="0 0 24 24"><path d="M10 3h4v4l1 1.5V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V8.5L10 7V3z"/><rect x="9" y="11" width="6" height="5"/><path d="M11 4h2"/></svg>`,
    // Beer mug with foam head + handle
    "beers": `<svg viewBox="0 0 24 24"><path d="M5 9h11v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9z"/><path d="M16 12h2a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-2"/><path d="M5 9c0-1.5 1.2-2.2 2-2 .8.2 1.2-.8 2-1 .8-.2 1.5.8 2.5.8s1.7-1 2.5-.8c.8.2 1.2 1.2 2 1 .8-.2 2 .5 2 2"/><path d="M9 13v5M12.5 13v5"/></svg>`,
    // Wine glass — slim bowl, long stem, footed base
    "wines": `<svg viewBox="0 0 24 24"><path d="M7.5 3h9c0 4.5-2 8-4.5 8S7.5 7.5 7.5 3z"/><path d="M9 6.5h6"/><path d="M12 11v9"/><path d="M8 20h8"/></svg>`,
    // Croissant on a plate (snacks/pastries)
    "snacks": `<svg viewBox="0 0 24 24"><ellipse cx="12" cy="18.5" rx="8.5" ry="1.5"/><path d="M4.5 14c0-3 3-6 7.5-6s7.5 3 7.5 6c0 1-1 1.5-2.5 1.5-1 0-2-1-3.5-1s-2.5 1-3.5 1c-1 0-2-1-3.5-1S4.5 15 4.5 14z"/><path d="M8 12.5l1.5 2M12 12v2.5M16 12.5l-1.5 2"/></svg>`,
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
      name.textContent = pickCatShortName(c);

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
