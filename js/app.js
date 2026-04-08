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

function renderList() {
  const tbody = document.getElementById("list-tbody");
  tbody.innerHTML = "";
  sorter.sort(taskMgr.getAll()).forEach(task => {
    const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-";
    tbody.innerHTML += `
      <tr>
        <td>${task.title}</td>
        <td><span class="badge-priority ${task.priority.toLowerCase()}">${task.priority}</span></td>
        <td>${task.status}</td>
        <td>${due}</td>
        <td>${task.assignedTo || "-"}</td>
        <td>
          <button class="btn-icon"        onclick="openEditModal('${task.id}')">✏️</button>
          <button class="btn-icon danger" onclick="deleteTask('${task.id}')">🗑️</button>
        </td>
      </tr>`;
  });
}

function renderCalendar() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  document.getElementById("calendar-title").textContent = now.toLocaleString("default", { month: "long", year: "numeric" });
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid        = document.getElementById("calendar-grid");
  grid.innerHTML    = "";
  for (let i = 0; i < firstDay; i++) grid.innerHTML += '<div class="cal-day empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr  = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    const isToday  = d === now.getDate();
    const dots     = taskMgr.getAll()
      .filter(t => t.dueDate && t.dueDate.startsWith(dateStr))
      .map(t => '<span class="cal-dot" style="background:' + ({ High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" }[t.priority]) + '"></span>')
      .join("");
    grid.innerHTML += `<div class="cal-day ${isToday ? "today" : ""}"><span class="cal-day-num">${d}</span><div class="cal-dots">${dots}</div></div>`;
  }
}

// ---------- TASK ACTIONS ----------
function changeStatus(id, status) { taskMgr.update(id, { status }); }

function deleteTask(id) {
  if (confirm("Delete this task?")) taskMgr.remove(id);
}

function filterTasks() {
  const query = document.getElementById("search-input").value.toLowerCase();
  document.querySelectorAll(".task-card").forEach(card => {
    card.style.display = card.querySelector(".task-title").textContent.toLowerCase().includes(query) ? "block" : "none";
  });
}

// ---------- MODAL ----------
function openCreateModal() {
  editingId = null;
  document.getElementById("modal-title").textContent = "Create Task";
  document.getElementById("task-form").reset();
  document.getElementById("task-modal").style.display = "flex";
}

function openEditModal(id) {
  const task = taskMgr.getById(id);
  if (!task) return;
  editingId = id;
  document.getElementById("modal-title").textContent = "Edit Task";
  document.getElementById("f-title").value           = task.title;
  document.getElementById("f-desc").value            = task.description;
  document.getElementById("f-assigned").value        = task.assignedTo;
  document.getElementById("f-priority").value        = task.priority;
  document.getElementById("f-status").value          = task.status;
  document.getElementById("f-due").value             = task.dueDate;
  document.getElementById("task-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("task-modal").style.display = "none";
  editingId = null;
}

function saveTask() {
  const title = document.getElementById("f-title").value.trim();
  if (!title) { alert("Title is required!"); return; }
  const data = {
    title,
    description: document.getElementById("f-desc").value,
    assignedTo:  document.getElementById("f-assigned").value,
    priority:    document.getElementById("f-priority").value,
    status:      document.getElementById("f-status").value,
    dueDate:     document.getElementById("f-due").value,
  };
  editingId ? taskMgr.update(editingId, data) : taskMgr.create(data);
  closeModal();
}

// ---------- STARTUP ----------
window.addEventListener("load", () => {
  if (currentUser) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").style.display          = "flex";
    renderAll();
  }
  if (taskMgr.getAll().length === 0) {
    taskMgr.create({ title: "Set up project repo",    priority: "High",   status: "Completed",   dueDate: "2025-03-10", assignedTo: "Subash" });
    taskMgr.create({ title: "Build login UI",         priority: "High",   status: "In Progress", dueDate: "2025-03-22", assignedTo: "Subash" });
    taskMgr.create({ title: "Write unit tests",       priority: "Medium", status: "To Do",       dueDate: "2025-03-28" });
    taskMgr.create({ title: "Deploy to GitHub Pages", priority: "Low",    status: "To Do",       dueDate: "2025-04-01" });
  }
});

document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });