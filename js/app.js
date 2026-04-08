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

// ---------- VIEWS ----------
function switchView(view) {
  currentView = view;
  document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
  document.querySelector('[data-view="' + view + '"]').classList.add("active");
  document.getElementById("kanban-view").style.display   = view === "kanban"   ? "grid"  : "none";
  document.getElementById("list-view").style.display     = view === "list"     ? "block" : "none";
  document.getElementById("calendar-view").style.display = view === "calendar" ? "block" : "none";
  renderView();
}

function renderView() {
  if (currentView === "kanban")   renderKanban();
  if (currentView === "list")     renderList();
  if (currentView === "calendar") renderCalendar();
}

function changeStrategy(name) {
  sorter.setStrategy(name);
  renderView();
}

function renderKanban() {
  ["To Do", "In Progress", "Completed"].forEach(status => {
    const col = document.getElementById("col-" + status.replace(/\s+/g, "-"));
    if (!col) return;
    col.innerHTML = "";
    sorter.sort(taskMgr.getAll())
      .filter(t => t.status === status)
      .forEach(t => { col.innerHTML += buildCard(t); });
  });
}

function buildCard(task) {
  const colors  = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };
  const color   = colors[task.priority];
  const due     = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date";
  const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Completed";
  return `
    <div class="task-card ${overdue ? "overdue" : ""}">
      <div class="task-priority-bar" style="background:${color}"></div>
      <div class="task-body">
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
          <span class="priority-badge" style="background:${color}22;color:${color}">${task.priority}</span>
          <span class="due-date ${overdue ? "overdue-text" : ""}">📅 ${due}</span>
        </div>
        ${task.assignedTo ? `<div class="assigned">👤 ${task.assignedTo}</div>` : ""}
        <div class="task-actions">
          <select class="status-select" onchange="changeStatus('${task.id}', this.value)">
            <option ${task.status === "To Do"       ? "selected" : ""}>To Do</option>
            <option ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option ${task.status === "Completed"   ? "selected" : ""}>Completed</option>
          </select>
          <button class="btn-icon"        onclick="openEditModal('${task.id}')">✏️</button>
          <button class="btn-icon danger" onclick="deleteTask('${task.id}')">🗑️</button>
        </div>
      </div>
    </div>`;
}

