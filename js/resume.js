/* Resume page: tabs, timeline accordions, print */

/* ---------- Tabs ---------- */
(function tabs() {
  const tabBar = document.getElementById("resume-tabs");
  if (!tabBar) return;
  const buttons = tabBar.querySelectorAll("button");
  const panes = document.querySelectorAll(".resume-pane");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.toggle("active", b === btn));
      panes.forEach((p) => (p.hidden = p.id !== "pane-" + btn.dataset.pane));
    });
  });
})();

/* ---------- Timeline accordions ---------- */
(function timeline() {
  const entries = document.querySelectorAll(".tl-entry");

  function setHeight(entry) {
    const body = entry.querySelector(".tl-body");
    body.style.maxHeight = entry.classList.contains("open")
      ? body.scrollHeight + "px"
      : "0";
  }

  entries.forEach((entry) => {
    const head = entry.querySelector(".tl-head");
    setHeight(entry);
    head.addEventListener("click", () => {
      entry.classList.toggle("open");
      setHeight(entry);
    });
  });

  const expandAll = document.getElementById("expand-all");
  if (expandAll) {
    expandAll.addEventListener("click", () => {
      const anyClosed = [...entries].some((e) => !e.classList.contains("open"));
      entries.forEach((e) => {
        e.classList.toggle("open", anyClosed);
        setHeight(e);
      });
      expandAll.textContent = anyClosed ? "Collapse all" : "Expand all";
    });
  }

  window.addEventListener("resize", () => entries.forEach(setHeight));
})();

/* ---------- Print / save as PDF ---------- */
(function printBtn() {
  const btn = document.getElementById("print-resume");
  if (!btn) return;
  btn.addEventListener("click", () => {
    // reveal all panes and entries so the printed resume is complete
    document.querySelectorAll(".resume-pane").forEach((p) => (p.hidden = false));
    document.querySelectorAll(".tl-entry").forEach((e) => {
      e.classList.add("open");
      const body = e.querySelector(".tl-body");
      body.style.maxHeight = "none";
    });
    setTimeout(() => window.print(), 150);
  });

  window.addEventListener("afterprint", () => {
    // restore tab state: show only the active pane again
    const active = document.querySelector("#resume-tabs button.active");
    if (!active) return;
    document.querySelectorAll(".resume-pane").forEach((p) => {
      p.hidden = p.id !== "pane-" + active.dataset.pane;
    });
  });
})();
