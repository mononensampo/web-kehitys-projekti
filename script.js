/* ==========================================================================
   Aamurutiinit – script.js
   ========================================================================== */

/* ---------- localStorage ---------- */

const STORAGE_KEY = "aamurutiinit";
const FILTER_KEY = "aamurutiinit-suodatin";
const FILTERS = ["all", "active", "done"];

const defaultTasks = [
  { id: 1, text: "Hampaiden harjaus", done: false },
  { id: 2, text: "Syö aamupala", done: false },
  { id: 3, text: "Petaa sänky", done: false }
];

// Hakee rutiinit selaimen muistista. Jos mitään ei ole tallennettu, käytetään oletusrutiineja.
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (e) {
    console.warn("Rutiinien lataus epäonnistui:", e);
  }
  return defaultTasks.map(t => ({ ...t }));
}

// Tallentaa rutiinit selaimen muistiin.
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn("Rutiinien tallennus epäonnistui:", e);
  }
}

// Hakee ja tallentaa viimeksi valitun suodattimen (Kaikki / Aktiiviset / Tehty).
function loadFilter() {
  try {
    const saved = localStorage.getItem(FILTER_KEY);
    if (FILTERS.includes(saved)) return saved;
  } catch (e) {}
  return "all";
}

function saveFilter() {
  try {
    localStorage.setItem(FILTER_KEY, filter);
  } catch (e) {}
}

/* ---------- Tila ja elementit ---------- */

let tasks = loadTasks();
let filter = loadFilter();

const list = document.getElementById("list");
const form = document.getElementById("add-form");
const input = document.getElementById("new-task");
const count = document.getElementById("count");
const filterButtons = document.querySelectorAll(".filters button");

/* ---------- Näkymä ---------- */

function render() {
  const shown = tasks.filter(t =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );

  list.innerHTML = "";

  if (!shown.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = tasks.length
      ? "Ei rutiineja tässä näkymässä."
      : "Ei rutiineja vielä. Lisää ensimmäinen yllä.";
    list.appendChild(empty);
  }

  shown.forEach(t => {
    const li = document.createElement("li");
    if (t.done) li.className = "done";

    const label = document.createElement("label");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = t.done;
    box.addEventListener("change", () => {
      t.done = box.checked;
      saveTasks();
      render();
    });

    const text = document.createElement("span");
    text.textContent = t.text;
    label.append(box, text);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "del";
    del.setAttribute("aria-label", "Poista rutiini: " + t.text);
    del.textContent = "×";
    del.addEventListener("click", () => {
      tasks = tasks.filter(x => x.id !== t.id);
      saveTasks();
      render();
    });

    li.append(label, del);
    list.appendChild(li);
  });

  const done = tasks.filter(t => t.done).length;
  count.textContent = tasks.length ? done + " / " + tasks.length + " tehty" : "";

  filterButtons.forEach(b =>
    b.setAttribute("aria-pressed", b.dataset.filter === filter)
  );
}

/* ---------- Tapahtumat ---------- */

form.addEventListener("submit", e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, done: false });
  input.value = "";
  saveTasks();
  render();
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    saveFilter();
    render();
  });
});

render();