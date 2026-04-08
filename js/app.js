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

