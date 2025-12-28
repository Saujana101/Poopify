// ambil data dari localStorage atau default []
const data = JSON.parse(localStorage.getItem("poopData")) || [];
let chart = null;

// elemen utama
const saveBtn = document.getElementById("saveBtn");
const historyEl = document.getElementById("history");

// REMINDER
const pupTimeInput = document.getElementById("pupTime");
const drinkIntervalInput = document.getElementById("drinkInterval");
const remindPupBtn = document.getElementById("remindPup");
const remindDrinkBtn = document.getElementById("remindDrink");

// INSIGHT
const gutStatusEl = document.getElementById("gutStatus");
const insightTextEl = document.getElementById("insightText");
const waterLevelEl = document.getElementById("waterLevel");
const fiberLevelEl = document.getElementById("fiberLevel");

// QUICK TIPS BUTTONS
document.querySelectorAll(".insight-tips button").forEach(btn => {
  btn.onclick = () => alert(`Tip: ${btn.innerText}`);
});

// simpan data baru
saveBtn.onclick = () => {
  const date = document.getElementById("date").value;
  const type = parseInt(document.getElementById("type").value);
  if (!date) return alert("Isi tanggal dulu");

  data.push({ date, type });
  localStorage.setItem("poopData", JSON.stringify(data));
  render();
};

// REMINDER (dummy, bisa dikembangkan Notification API)
remindPupBtn.onclick = () => {
  const time = pupTimeInput.value;
  if (!time) return alert("Pilih waktu pup dulu");
  alert(`Reminder pup di-set pukul ${time}`);
};

remindDrinkBtn.onclick = () => {
  const interval = drinkIntervalInput.value;
  alert(`Reminder minum di-set setiap ${interval} menit`);
};

// render semua section
function render() {
  renderSummary();
  renderHistory();
  renderInsight();
  renderChart();
}

// RENDER SUMMARY
function renderSummary() {
  const today = new Date().toISOString().slice(0,10);
  const todayData = data.filter(d => d.date === today);
  document.getElementById("todayCount").innerText = todayData.length;
  document.getElementById("avgType").innerText =
    todayData.length ? todayData.at(-1).type : "-";
}

// RENDER HISTORY (5 terakhir)
function renderHistory() {
  historyEl.innerHTML = "";
  data.slice(-5).reverse().forEach(d => {
    const li = document.createElement("li");
    li.innerText = `${d.date} — Type ${d.type}`;
    historyEl.appendChild(li);
  });
}

// RENDER INSIGHT
function renderInsight() {
  if (data.length < 3) {
    gutStatusEl.innerText = "Usus kamu butuh lebih banyak data";
    insightTextEl.innerText = "Data masih sedikit 💚";
    waterLevelEl.style.width = "20%";
    fiberLevelEl.style.width = "20%";
    return;
  }

  const last3 = data.slice(-3).map(d => d.type);
  if (last3.every(x => x <= 2)) {
    gutStatusEl.innerText = "Kurang serat & air";
    insightTextEl.innerText = "Perbanyak minum & serat 🌱";
    waterLevelEl.style.width = "30%";
    fiberLevelEl.style.width = "30%";
  } else if (last3.every(x => x >= 6)) {
    gutStatusEl.innerText = "Pencernaan terlalu cair";
    insightTextEl.innerText = "Konsumsi serat lebih banyak 🥦";
    waterLevelEl.style.width = "70%";
    fiberLevelEl.style.width = "50%";
  } else {
    gutStatusEl.innerText = "Pencernaan relatif stabil ✨";
    insightTextEl.innerText = "Pertahankan pola makan & minum 💧";
    waterLevelEl.style.width = "60%";
    fiberLevelEl.style.width = "60%";
  }
}

// RENDER CHART (7 hari terakhir)
function renderChart() {
  const ctx = document.getElementById("poopChart");
  if (!ctx) return;

  const labels = [];
  const counts = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0,10);
    labels.push(ds.slice(5));
    counts.push(data.filter(x => x.date === ds).length);
  }

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: "#A5D6A7", // hijau Flo palette
        borderRadius: 10
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true },
        x: { grid: { display: false } }
      }
    }
  });
}

// init render
render();
