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

// ======= 1. Notification Setup =======
if ("Notification" in window) {
  Notification.requestPermission().then(permission => {
    if (permission === "granted") console.log("Notifikasi diizinkan ✅");
  });
}

// fungsi buat menampilkan notifikasi
function showNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: 'icons/icon-192.png' });
  }
}

// reminder pup otomatis per jam tertentu
let pupReminderInterval = null;
function setPupReminder(timeStr) {
  if (!timeStr) return;
  if (pupReminderInterval) clearInterval(pupReminderInterval);

  const [hour, minute] = timeStr.split(":").map(Number);

  pupReminderInterval = setInterval(() => {
    const now = new Date();
    if (now.getHours() === hour && now.getMinutes() === minute) {
      showNotification("Poopify Reminder 🚽", "Waktunya catat pupmu hari ini!");
    }
  }, 60 * 1000); // cek tiap menit
}

// reminder minum air tiap X menit
let drinkReminderInterval = null;
function setDrinkReminder(minutes) {
  if (drinkReminderInterval) clearInterval(drinkReminderInterval);
  if (!minutes || minutes <= 0) return;
  drinkReminderInterval = setInterval(() => {
    showNotification("Poopify Reminder 💧", "Waktunya minum air!");
  }, minutes * 60 * 1000);
}

// ======= 2. Simpan data baru =======
saveBtn.onclick = () => {
  const date = document.getElementById("date").value;
  const type = parseInt(document.getElementById("type").value);
  if (!date) return alert("Isi tanggal dulu");
  if (!type || type < 1 || type > 7) return alert("Pilih tipe pup sesuai Bristol Chart (1-7)");

  data.push({ date, type });
  localStorage.setItem("poopData", JSON.stringify(data));
  render();
};

// REMINDER
remindPupBtn.onclick = () => {
  const time = pupTimeInput.value;
  if (!time) return alert("Pilih waktu pup dulu");
  setPupReminder(time);
  alert(`Reminder pup di-set pukul ${time}`);
};

remindDrinkBtn.onclick = () => {
  const interval = drinkIntervalInput.value;
  if (!interval || interval <= 0) return alert("Isi interval minum dengan benar");
  setDrinkReminder(interval);
  alert(`Reminder minum di-set setiap ${interval} menit`);
};

// ======= 3. Render semua section =======
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
    gutStatusEl.innerText = "Pencernaan terlalu lembek";
    insightTextEl.innerText = "Kurangi air & perbanyak makanan padat 🍌";
    waterLevelEl.style.width = "80%";
    fiberLevelEl.style.width = "80%";
  } else {
    gutStatusEl.innerText = "Usus sehat & stabil";
    insightTextEl.innerText = "Good job! 💚";
    waterLevelEl.style.width = "60%";
    fiberLevelEl.style.width = "60%";
  }
}

// RENDER CHART
function renderChart() {
  const ctx = document.getElementById("poopChart").getContext("2d");
  const labels = [...new Set(data.map(d => d.date))];
  const chartData = labels.map(label => {
    const types = data.filter(d => d.date === label).map(d => d.type);
    return types.length ? types.at(-1) : 0;
  });

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Tipe Pup',
        data: chartData,
        backgroundColor: '#4CAF50'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, min: 0, max: 7, stepSize: 1 } }
    }
  });
}

// render saat load
render();
