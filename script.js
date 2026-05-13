(() => {
  "use strict";

  const STATE = {
    lang: localStorage.getItem("kafeneon-lang") || "el",
    data: null,
    query: "",
    mode: new URLSearchParams(location.search).get("delivery") === "1" ? "delivery" : "dinein",
  };

  const LABELS = {
    el: {
      search: "Αναζήτηση…",
      searchAll: "Αναζήτηση σε όλα τα προϊόντα…",
      empty: "Δεν βρέθηκαν προϊόντα.",
      vat: "Τιμές σε ευρώ. Συμπεριλαμβάνεται ΦΠΑ.",
      back: "Πίσω",
      items: (n) => `${n} προϊόντα`,
      call: "Κλήση",
      directions: "Διεύθυνση",
      instagram: "Instagram",
      orderOnline: "Παραγγείλετε Online",
    },
    en: {
      search: "Search…",
      searchAll: "Search all items…",
      empty: "No items found.",
      vat: "Prices in euro. VAT included.",
      back: "Back",
      items: (n) => `${n} items`,
      call: "Call",
      directions: "Directions",
      instagram: "Instagram",
      orderOnline: "Order Online",
    },
  };

  const FOOT_ICONS = {
    phone: `<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    map:   `<svg viewBox="0 0 24 24"><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    insta: `<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
  };

  // Icons from Lucide (lucide.dev) — MIT licensed, ISC original, hand-tuned
  const ICONS = {
    // lucide: coffee
    "coffees-beverages": `<svg viewBox="0 0 24 24"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>`,
    // teacup on saucer with tea-wave + handle + 3 sinuous steam wisps + ONE bigger leaf (filled deep sage)
    "tea": `<svg viewBox="0 0 24 24"><path d="M9 2c-.5 1-.5 2 0 3s.5 2 0 3"/><path d="M12 2c-.5 1-.5 2 0 3s.5 2 0 3"/><path d="M15 2c-.5 1-.5 2 0 3s.5 2 0 3"/><path d="M5 9h13v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z"/><path d="M5.5 12c2-1 4 1 6 0s4 1 6 0"/><path d="M18 11h2a2 2 0 0 1 0 4h-2"/><ellipse cx="12" cy="20" rx="10" ry="1.5"/><path d="M7.5 18C9 14 6 11 1.5 12C2 16 4 19 7.5 18Z" fill="#b9cdb4"/></svg>`,
    // lucide: martini-glass — V-glass + olive on a pick
    "cocktails": `<svg viewBox="0 0 24 24"><path d="M8 22h8"/><path d="M12 11v11"/><path d="m19 3-7 8-7-8Z"/><path d="M16 4l-2.5 2.5"/><circle cx="14" cy="6.5" r="1.1" fill="currentColor"/></svg>`,
    // lucide: cup-soda
    "soft-drinks": `<svg viewBox="0 0 24 24"><path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"/><path d="M5 8h14"/><path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/><path d="m12 8 1-6h2"/></svg>`,
    // whiskey rocks glass — open rim, liquid level, two ice cubes (filled deep sage), foot line
    "drinks": `<svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="6.5" ry="1.5"/><path d="M5.5 5v13.5c0 1.5 13 1.5 13 0V5"/><path d="M5.5 11c0 1.5 13 1.5 13 0"/><rect x="7.5" y="10.5" width="4" height="4" rx="0.5" fill="#b9cdb4"/><rect x="11" y="12.5" width="4" height="4" rx="0.5" fill="#b9cdb4"/><path d="M7 20h10"/></svg>`,
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
    n == null
      ? ""
      : new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(n);

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
  // In each mode the price for that mode is authoritative; no cross-mode fallback.
  // Missing price => null => renders as empty (intentional: surfaces gaps in the price list).
  const pickPrice = (it) =>
    STATE.mode === "delivery" ? (it.price_delivery ?? null) : (it.price ?? null);
  const pickVariantPrice = (v) =>
    STATE.mode === "delivery" ? (v.price_delivery ?? null) : (v.price ?? null);

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
        cell.textContent = fmtPrice(pickVariantPrice(v));
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
        amount.textContent = fmtPrice(pickVariantPrice(v));
        line.append(label, amount);
        price.appendChild(line);
      });
    } else {
      price.textContent = fmtPrice(pickPrice(it));
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

    // Global search input (filters across every category)
    const searchWrap = document.createElement("div");
    searchWrap.className = "home-search";
    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = t().searchAll;
    search.value = STATE.homeQuery || "";
    search.autocomplete = "off";
    search.addEventListener("input", (e) => {
      STATE.homeQuery = e.target.value;
      drawHomeBody();
    });
    searchWrap.appendChild(search);
    root.appendChild(searchWrap);

    const body = document.createElement("div");
    body.id = "home-body";
    root.appendChild(body);

    function drawHomeBody() {
      body.innerHTML = "";
      const q = (STATE.homeQuery || "").trim().toLowerCase();
      if (!q) {
        body.appendChild(buildTileGrid());
        return;
      }
      // Search results grouped by category
      const groups = STATE.data.categories
        .map((c) => ({
          cat: c,
          items: c.items.filter((it) => itemMatchesQuery(it, q)),
        }))
        .filter((g) => g.items.length > 0);

      if (!groups.length) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = t().empty;
        body.appendChild(empty);
        return;
      }

      groups.forEach((g) => {
        const block = document.createElement("section");
        block.className = "home-search-group";

        const head = document.createElement("a");
        head.className = "home-search-cat";
        head.href = `#${g.cat.id}`;
        head.textContent = pickCatName(g.cat);
        block.appendChild(head);

        g.items.forEach((it) => {
          const link = document.createElement("a");
          link.className = "home-search-item";
          link.href = `#${g.cat.id}`;
          link.innerHTML = `<span class="home-search-name">${escapeHtml(pickName(it))}</span><span class="home-search-price">${escapeHtml(fmtPrice(pickPrice(it)))}</span>`;
          block.appendChild(link);
        });

        body.appendChild(block);
      });
    }

    drawHomeBody();
  }

  function buildTileGrid() {
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

      a.append(iconWrap, name);
      grid.appendChild(a);
    });
    return grid;
  }

  function itemMatchesQuery(it, q) {
    if (!q) return true;
    const fields = [it.name, it.name_en, it.description, it.description_en, it.section, it.section_en];
    return fields.some((f) => f && f.toLowerCase().includes(q));
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
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
      const shop = STATE.data.shop;

      // Address as a tap-to-map link (icon + text)
      const addr = $("#address");
      addr.querySelector(".brand-address-text").textContent = shop.address || "";
      if (shop.maps_url) {
        addr.href = shop.maps_url;
      } else {
        addr.removeAttribute("href");
      }

      // Hero phone button + "Take Away" caption (top-left) — delivery mode only
      const heroCta = $("#hero-cta");
      const heroPhone = $("#hero-phone");
      const heroOrder = $("#hero-order");
      const heroOrderSub = $("#hero-order-sub");
      if (STATE.mode === "delivery" && shop.phone) {
        heroPhone.href = "tel:" + shop.phone;
        const number = shop.phone_display || shop.phone;
        heroPhone.querySelector(".hero-phone-text").textContent = number;
        heroPhone.setAttribute("aria-label", t().call + " " + number);
        heroPhone.hidden = false;
        heroCta.hidden = false;
      } else {
        heroPhone.hidden = true;
        heroCta.hidden = true;
      }

      if (STATE.mode === "delivery" && shop.delivery_url) {
        heroOrder.href = shop.delivery_url;
        heroOrder.querySelector(".hero-order-text").textContent = t().orderOnline;
        heroOrder.setAttribute("aria-label", t().orderOnline);
        heroOrder.hidden = false;
        heroOrderSub.hidden = false;
        heroCta.hidden = false;
      } else {
        heroOrder.hidden = true;
        heroOrderSub.hidden = true;
      }

      // Hero social icons (Instagram + Facebook), under the logo
      renderHeroSocials(shop);

      render();
    }
  }

  function renderHeroSocials(shop) {
    const host = $("#hero-socials");
    host.innerHTML = "";
    const socials = [];
    if (shop.facebook_url) {
      socials.push({ href: shop.facebook_url, icon: FOOT_ICONS.facebook, aria: "Facebook" });
    }
    if (shop.instagram_url) {
      socials.push({ href: shop.instagram_url, icon: FOOT_ICONS.insta, aria: "Instagram" });
    }
    socials.forEach((s) => {
      const link = document.createElement("a");
      link.className = "hero-social";
      link.href = s.href;
      link.target = "_blank";
      link.rel = "noopener";
      link.setAttribute("aria-label", s.aria);
      link.innerHTML = s.icon;
      host.appendChild(link);
    });
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
