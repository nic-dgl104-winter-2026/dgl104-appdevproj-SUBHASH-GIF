
// 1. SINGLETON PATTERN — only one database instance ever exists
class TaskDatabase {
  constructor() {
    if (TaskDatabase._instance) return TaskDatabase._instance;
    this.storageKey = "tms_tasks";
    this.userKey = "tms_user";
    TaskDatabase._instance = this;
  }

  save(tasks) {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }

  load() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  saveUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  loadUser() {
    const data = localStorage.getItem(this.userKey);
    return data ? JSON.parse(data) : null;
  }

  clearUser() {
    localStorage.removeItem(this.userKey);
  }
}

TaskDatabase._instance = null;

