const db      = new TaskDatabase();
const taskMgr = new TaskManager();
const sorter  = new TaskSorter();

let currentUser = db.loadUser();
let editingId   = null;
let currentView = "kanban";
let chartInstance = null;

// Observer - show toast and re-render on every task change
notifier.subscribe((event) => {
  const messages = {
    task_created: "✅ Task created!",
    task_updated: "✏️ Task updated!",
    task_deleted: "🗑️ Task deleted!",
  };
  showToast(messages[event]);
  renderAll();
});

function showToast(message) {
  const toast = document.createElement("div");
  toast.className   = "toast";
  toast.textContent = message;
  document.getElementById("toast-container").appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ---------- LOGIN / LOGOUT ----------
function login() {
  const name  = document.getElementById("login-name").value.trim();
  const email = document.getElementById("login-email").value.trim();
  const role  = document.getElementById("login-role").value;
  if (!name || !email) { alert("Please enter name and email."); return; }

  currentUser = UserFactory.create(role, name, email); // Factory Pattern
  db.saveUser(currentUser);
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("app").style.display          = "flex";
  renderAll();
  showToast("Welcome, " + currentUser.name + "!");
}

function logout() {
  db.clearUser();
  currentUser = null;
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("app").style.display          = "none";
}

// ---------- RENDER ----------
function renderAll() {
  if (!currentUser) return;
  document.getElementById("user-name").textContent      = currentUser.name;
  document.getElementById("user-role").textContent      = currentUser.role;
  document.getElementById("user-role").style.background = currentUser.color;

  const s = taskMgr.getStats();
  document.getElementById("stat-total").textContent    = s.total;
  document.getElementById("stat-todo").textContent     = s.todo;
  document.getElementById("stat-progress").textContent = s.inProgress;
  document.getElementById("stat-done").textContent     = s.completed;
  document.getElementById("stat-high").textContent     = s.high;

  drawChart(s);
  renderView();
}

function drawChart(s) {
  const canvas = document.getElementById("task-chart");
  if (!canvas) return;
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["To Do", "In Progress", "Completed"],
      datasets: [{ data: [s.todo, s.inProgress, s.completed], backgroundColor: ["#f59e0b", "#6366f1", "#10b981"], borderColor: "#1e293b", borderWidth: 2 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: "#94a3b8" } } } }
  });
}

