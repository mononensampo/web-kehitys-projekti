
/* ---------- Vakiot ---------- */

const STORAGE_KEY = "aamurutiinit";            // Avain, jolla rutiinit tallennetaan
const FILTER_KEY = "aamurutiinit-suodatin";    // Avain, jolla valittu suodatin tallennetaan
const FILTERS = ["all", "active", "done"];     // Sallitut suodatinarvot

// Rutiinit, jotka näytetään, kun mitään ei ole vielä tallennettu
const defaultTasks = [
  { id: 1, text: "Hampaiden harjaus 🦷", done: false },
  { id: 2, text: "Syö aamupala 🥣", done: false },
  { id: 3, text: "Petaa sänky 🛏️", done: false }
];

/* ---------- localStorage ---------- */

// Hakee rutiinit selaimen muistista.
// Jos mitään ei ole tallennettu, palautetaan oletusrutiinit.
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (e) {
    console.warn("Rutiinien lataus epäonnistui:", e);
  }
  // Kopio oletuksista, ettei alkuperäistä taulukkoa muokata vahingossa
  return defaultTasks.map(t => ({ ...t }));
}

// Tallentaa nykyiset rutiinit selaimen muistiin.
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn("Rutiinien tallennus epäonnistui:", e);
  }
}

// Hakee viimeksi valitun suodattimen (Kaikki / Aktiiviset / Tehty).
// Jos arvo puuttuu tai on virheellinen, käytetään "all".
function loadFilter() {
  try {
    const saved = localStorage.getItem(FILTER_KEY);
    if (FILTERS.includes(saved)) return saved;
  } catch {
    // localStorage ei käytettävissä (esim. yksityinen selaus) -> oletusarvo
  }
  return "all";
}

// Tallentaa valitun suodattimen selaimen muistiin.
function saveFilter() {
  try {
    localStorage.setItem(FILTER_KEY, filter);
  } catch {
    // Tallennus epäonnistui: ei haittaa, suodatin vain unohtuu sivun latauksessa
  }
}

/* ---------- Tila ja elementit ---------- */

let tasks = loadTasks();    // Kaikki rutiinit
let filter = loadFilter();  // Valittu suodatin

const list = document.getElementById("list");        // Rutiinilista
const form = document.getElementById("add-form");    // Lisäyslomake
const input = document.getElementById("new-task");   // Tekstikenttä
const count = document.getElementById("count");      // Laskuri "x / y tehty"
const filterButtons = document.querySelectorAll(".filters button"); // Suodatinpainikkeet

/* ---------- Näkymä ---------- */

// Piirtää listan, laskurin ja suodatinpainikkeet uudelleen nykyisen tilan mukaan.
function render() {
  // Valitaan suodattimen mukaiset rutiinit
  const shown = tasks.filter(t =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );

  list.innerHTML = ""; // Tyhjennetään vanha lista

  // Jos näytettäviä rutiineja ei ole, näytetään ohjeteksti
  if (!shown.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = tasks.length
      ? "Ei rutiineja tässä näkymässä."
      : "Ei rutiineja vielä. Lisää ensimmäinen yllä.";
    list.appendChild(empty);
  }

  // Luodaan jokaiselle rutiinille oma rivi
  shown.forEach(t => {
    const li = document.createElement("li");
    if (t.done) li.className = "done"; // Tehdyt rutiinit saavat oman tyylinsä

    // Valintaruutu + teksti samassa label-elementissä (ruutua voi klikata tekstistäkin)
    const label = document.createElement("label");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = t.done;
    box.addEventListener("change", () => {
      t.done = box.checked; // Päivitetään tila
      saveTasks();
      render();
    });

    const text = document.createElement("span");
    text.textContent = t.text; // textContent estää HTML-koodin injektoinnin
    label.append(box, text);

    // Poistopainike
    const del = document.createElement("button");
    del.type = "button";
    del.className = "del";
    del.setAttribute("aria-label", "Poista rutiini: " + t.text);
    del.textContent = "×";
    del.addEventListener("click", () => {
      tasks = tasks.filter(x => x.id !== t.id); // Poistetaan id:n perusteella
      saveTasks();
      render();
    });

    li.append(label, del);
    list.appendChild(li);
  });

  // Päivitetään laskuri
  const done = tasks.filter(t => t.done).length;
  count.textContent = tasks.length ? done + " / " + tasks.length + " tehty" : "";

  filterButtons.forEach(b =>
    b.setAttribute("aria-pressed", b.dataset.filter === filter)
  );
}

/* ---------- Tapahtumat ---------- */

// Uuden rutiinin lisäys
form.addEventListener("submit", e => {
  e.preventDefault();                 // Estetään sivun uudelleenlataus
  const text = input.value.trim();    // Poistetaan ylimääräiset välilyönnit
  if (!text) return;                  // Tyhjää ei lisätä
  tasks.push({ id: Date.now(), text, done: false }); 
  input.value = "";
  saveTasks();
  render();
});

// Suodattimen vaihto painikkeista
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    saveFilter();
    render();
  });
});

// Ensimmäinen piirto sivun latautuessa
render();