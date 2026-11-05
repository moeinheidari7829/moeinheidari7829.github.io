(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- Active nav link on scroll ---------- */
  const navLinks = $$(".nav-links .nav-link");
  const updateActiveNav = () => {
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
    const position = window.scrollY + 120;
    let current = null;
    navLinks.forEach((link) => {
      const section = $(link.hash);
      if (section && position >= section.offsetTop) current = link;
    });
    if (nearBottom) current = navLinks[navLinks.length - 1];
    navLinks.forEach((link) => link.classList.toggle("active", link === current));
  };
  document.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  /* ---------- News: show the most recent items, toggle the rest ---------- */
  const RECENT_NEWS = 6;
  const newsItems = $$("#news .news-list > li");
  const newsToggle = $(".news-toggle");
  const setNewsExpanded = (expanded) => {
    newsItems.forEach((item, i) => item.classList.toggle("news-hidden", !expanded && i >= RECENT_NEWS));
    if (!newsToggle) return;
    newsToggle.textContent = expanded ? "show recent news only" : "show older news";
    newsToggle.setAttribute("aria-expanded", String(expanded));
  };
  if (newsToggle && newsItems.length > RECENT_NEWS) {
    newsToggle.addEventListener("click", () =>
      setNewsExpanded(newsToggle.getAttribute("aria-expanded") !== "true"));
    setNewsExpanded(false);
  } else if (newsToggle) {
    newsToggle.hidden = true;
  }

  /* ---------- Publications: year filter ---------- */
  const cards = $$("#publications .post");
  const status = $(".publication-status");
  const filters = $$(".pub-filter");
  const applyFilter = (year) => {
    let shown = 0;
    cards.forEach((card) => {
      const visible = year === "all" || card.dataset.year === year;
      card.classList.toggle("is-hidden", !visible);
      if (visible) shown += 1;
    });
    if (status) {
      status.textContent = year === "all"
        ? `Showing all ${shown} publications.`
        : `Showing ${shown} publication${shown === 1 ? "" : "s"} from ${year}.`;
    }
  };
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((b) => {
        b.classList.toggle("is-active", b === button);
        b.setAttribute("aria-pressed", String(b === button));
      });
      applyFilter(button.dataset.filter || "all");
    });
  });

  /* ---------- Abstract toggles: accessible labels ---------- */
  cards.forEach((card) => {
    const details = $(".pub-abstract", card);
    const summary = details && $(".pub-abstract-toggle", details);
    if (!summary) return;
    const title = ($(".pub-title", card)?.textContent || "publication").replace(/\s+/g, " ").trim();
    const label = () => summary.setAttribute("aria-label", `${details.open ? "Hide" : "Show"} abstract for ${title}`);
    details.addEventListener("toggle", label);
    label();
  });

  /* ---------- Teaser lightbox ---------- */
  const box = $("#lightbox");
  const boxImg = box && $("img", box);
  const boxCap = box && $("figcaption", box);
  let lastTrigger = null;
  const closeBox = () => {
    if (!box || box.hidden) return;
    box.hidden = true;
    document.body.style.overflow = "";
    if (lastTrigger) lastTrigger.focus();
  };
  $$(".pub-media").forEach((media) => {
    const img = $("img", media);
    if (!img || !box) return;
    const title = ($(".pub-title", media.parentElement)?.textContent || img.alt).replace(/\s+/g, " ").trim();
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "pub-media-link";
    trigger.setAttribute("aria-label", `Open full teaser for ${title}`);
    trigger.innerHTML = '<span class="pub-media-link-label"><span>view teaser</span><i class="fas fa-expand-alt" aria-hidden="true"></i></span>';
    trigger.addEventListener("click", () => {
      lastTrigger = trigger;
      boxImg.src = img.currentSrc || img.src;
      boxImg.alt = img.alt;
      boxCap.textContent = title;
      box.hidden = false;
      document.body.style.overflow = "hidden";
      $(".lightbox-close", box).focus();
    });
    media.appendChild(trigger);
  });
  $$(".news-figure").forEach((btn) => {
    const img = $("img", btn);
    if (!img || !box) return;
    btn.addEventListener("click", () => {
      lastTrigger = btn;
      boxImg.src = btn.dataset.full || img.src;
      boxImg.alt = img.alt;
      boxCap.textContent = img.alt;
      box.hidden = false;
      document.body.style.overflow = "hidden";
      $(".lightbox-close", box).focus();
    });
  });
  if (box) {
    box.addEventListener("click", (e) => { if (e.target !== boxImg) closeBox(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeBox(); });
  }
})();
