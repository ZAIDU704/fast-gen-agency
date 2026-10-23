(function () {
  "use strict";
  const C = window.FASTGEN_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Setup reminder + placeholder detection ---------- */
  const waPlaceholder = !/^\d{8,15}$/.test(C.whatsapp);
  const mailPlaceholder = /@example\.com$/i.test(C.email) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(C.email);
  if (waPlaceholder || mailPlaceholder) $("#setupBar").hidden = false;

  /* ---------- Mobile nav ---------- */
  const toggle = $(".nav-toggle"), nav = $("#nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$("#nav a").forEach((a) => a.addEventListener("click", () => {
    nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
  }));

  /* ---------- Enquiry template, WhatsApp and email links ---------- */
  const ids = ["name", "business", "service", "budget", "deadline", "details"];
  const msg = $("#msg"), status = $("#sendStatus");
  const fill = () => {
    const v = {};
    ids.forEach((k) => (v[k] = ($("#f-" + k).value || "").trim() || "—"));
    msg.value = C.enquiryTemplate.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
    links();
  };
  const waUrl = () => "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(msg.value);
  const mailUrl = () => "mailto:" + C.email + "?subject=" + encodeURIComponent("Project enquiry — " + C.brand) + "&body=" + encodeURIComponent(msg.value);
  function links() {
    $("#waBtn").href = waUrl();
    $("#mailBtn").href = mailUrl();
    $("#footWa").href = "https://wa.me/" + C.whatsapp;
    $("#footMail").href = "mailto:" + C.email;
  }
  ids.forEach((k) => $("#f-" + k).addEventListener("input", fill));
  msg.addEventListener("input", links);
  // While placeholders remain, don't open a dead/fake destination; explain instead.
  const guard = (isPlaceholder, what, file) => (e) => {
    if (!isPlaceholder) return;
    e.preventDefault();
    status.textContent = "Setup needed: the " + what + " is still a placeholder. Replace it in js/config.js, then this button will work.";
  };
  $("#waBtn").addEventListener("click", guard(waPlaceholder, "WhatsApp number"));
  $("#footWa").addEventListener("click", guard(waPlaceholder, "WhatsApp number"));
  $("#mailBtn").addEventListener("click", guard(mailPlaceholder, "email address"));
  $("#footMail").addEventListener("click", guard(mailPlaceholder, "email address"));
  $("#copyBtn").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(msg.value); status.textContent = "Message copied. Paste it into any chat or email."; }
    catch (_) { msg.select(); status.textContent = "Press Ctrl+C (or long-press and Copy) to copy the selected message."; }
  });
  $("#contactCta").addEventListener("click", () => setTimeout(() => $("#f-name").focus({ preventScroll: true }), 400));
  fill();

  /* ---------- Characters ---------- */
  const heroEl = $("#heroStage"), guideEl = $("#guideStage");
  if (!window.FastGenCharacter) return;
  const hero = new window.FastGenCharacter(heroEl);
  const guide = new window.FastGenCharacter(guideEl);
  const isClip = (c) => ["greeting", "pointScreenLeft", "pointScreenRight"].includes(c.state);
  let greeted = false, pointedExplore = false, interacted = false;

  const nudge = (el, on) => el.classList.toggle("nudge", on);

  function pointToExplore() {
    if (pointedExplore) return;
    pointedExplore = true;
    const btn = $("#exploreBtn");
    nudge(btn, true);
    const done = () => nudge(btn, false);
    hero.pointExplore(done);
    setTimeout(done, 7000);
  }
  function greet(force) {
    if (greeted && !force) return;
    greeted = true;
    hero.greet(() => { if (!pointedExplore) pointToExplore(); });
  }
  // First deliberate interaction -> greeting (once). Later: button / centre tap replays it.
  function firstInteraction() {
    if (interacted) return;
    interacted = true;
    clearTimeout(autoTimer);
    greet(false);
  }

  // Zones: mouse hover selects a zone; touch/keyboard use click. Hover never interrupts a playing clip.
  $$("[data-look]").forEach((el) => {
    const side = el.dataset.look;
    el.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      if (!interacted) { firstInteraction(); return; }
      if (!isClip(hero)) hero.look(side);
    });
    el.addEventListener("click", () => { interacted = true; clearTimeout(autoTimer); hero.look(side); });
  });
  $$("[data-greet]").forEach((el) => el.addEventListener("click", () => {
    interacted = true; clearTimeout(autoTimer); greeted = true;
    hero.greet(() => { if (!pointedExplore) pointToExplore(); });
  }));
  heroEl.addEventListener("pointerdown", () => { if (!interacted) firstInteraction(); });

  // If nobody interacts, still guide the visitor to Explore Services once the hero is in view.
  let autoTimer = null;
  const heroIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting && !pointedExplore && !interacted) {
        clearTimeout(autoTimer);
        autoTimer = setTimeout(pointToExplore, 1600);
      } else clearTimeout(autoTimer);
    });
  }, { threshold: 0.5 });
  heroIO.observe(heroEl);

  // End of services: point at Contact Here (once per arrival, with cooldown)
  let lastGuide = 0;
  const contactBtn = $("#contactBtnGuide");
  function pointToContact() {
    if (Date.now() - lastGuide < 15000 || isClip(guide)) return;
    lastGuide = Date.now();
    nudge(contactBtn, true);
    const done = () => nudge(contactBtn, false);
    guide.pointContact(done);
    setTimeout(done, 7000);
  }
  new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) pointToContact(); });
  }, { threshold: 0.7 }).observe($("#guideBand"));
  guideEl.addEventListener("click", () => { lastGuide = 0; pointToContact(); });

  // Pause work when the tab is hidden
  document.addEventListener("visibilitychange", () => { if (document.hidden) { hero.idle(); guide.idle(); } });
  window.__fastgen = { hero, guide }; // handy for testing in DevTools
})();
