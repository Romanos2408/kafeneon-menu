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
  const pickCatName = (c) => (STATE.lang === "en" && c.name_en ? c.name_en : c.name);

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

  function renderMenu() {
    const root = $("#menu");
    root.innerHTML = "";
    const q = STATE.query.trim().toLowerCase();

    let anyVisible = false;

    STATE.data.categories.forEach((cat) => {
      const section = document.createElement("section");
      section.className = "cat";
      section.id = cat.id;

      const h = document.createElement("h2");
      h.className = "cat-title";
      h.textContent = pickCatName(cat);
      section.appendChild(h);

      let visibleInCat = 0;

      cat.items.forEach((it) => {
        const name = pickName(it);
        const matches =
          !q ||
          name.toLowerCase().includes(q) ||
          (it.name && it.name.toLowerCase().includes(q)) ||
          (it.name_en && it.name_en.toLowerCase().includes(q));

        const row = document.createElement("div");
        row.className = "item" + (matches ? "" : " hidden");

        const n = document.createElement("span");
        n.className = "item-name";
        n.textContent = name;

        const d = document.createElement("span");
        d.className = "item-dots";

        const p = document.createElement("span");
        p.className = "item-price";
        p.textContent = fmtPrice(it.price);

        row.append(n, d, p);
        section.appendChild(row);
        if (matches) visibleInCat++;
      });

      if (visibleInCat > 0 || !q) {
        if (q && visibleInCat === 0) {
          // skip empty categories during search
        } else {
          root.appendChild(section);
          anyVisible = true;
        }
      }
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
      document.title = `${data.shop.name} — ${data.shop.subtitle || "Menu"}`;
    }
    applyLanguage();
  }

  init();
})();
