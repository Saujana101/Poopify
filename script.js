const data = JSON.parse(localStorage.getItem("poopData")) || [];
let chart = null;

const saveBtn = document.getElementById("saveBtn");
const historyEl = document.getElementById("history");

saveBtn.onclick = () => {
  const date = document.getElementById("date").value;
  const type = document.getElementById("type").value;
  if (!date) return alert("Isi tanggal dulu");

  data.push({ date, type });
  localStorage.setItem("poopData", JSON.stringify(data));
  render();
};

function render() {
  renderSummary();
  renderHistory();
  renderInsight();
  renderChart();
}

function renderSummary() {
  const today = new Date().toISOString().slice(0,10);
  const todayData = data.filter(d => d.date === today);
  document.getElementById("todayCount").innerText = todayData.length;
  document.getElementById("avgType").innerText =
    todayData.length ? todayData.at(-1).type : "-";
}

function renderHistory() {
  historyEl.innerHTML = "";
  data.slice(-5).reverse().forEach(d => {
    historyEl.innerHTML += `<li>${d.date} — Type ${d.type}</li>`;
  });
}

function renderInsight() {
  const t = document.getElementById("insightText");
  if (data.length < 3) {
    t.innerText = "Data masih sedikit";
    return;
  }
  const last = data.slice(-3).map(d => d.type);
  if (last.every(x => x <= 2)) t.innerText = "Kurang serat & air";
  else if (last.every(x => x >= 6)) t.innerText = "Pencernaan terlalu cair";
  else t.innerText = "Pencernaan relatif stabil ✨";
}

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
        backgroundColor: "#A5D6A7",
        borderRadius: 10
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

render();
