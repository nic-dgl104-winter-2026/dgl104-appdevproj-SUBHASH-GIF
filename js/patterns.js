
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


// 2. FACTORY PATTERN — creates the correct user type by role
class User {
  constructor(name, role, email) {
    this.name  = name;
    this.role  = role;
    this.email = email;
  }
}

class AdminUser extends User {
  constructor(name, email) {
    super(name, "Admin", email);
    this.color = "#ef4444";
  }
}

class ManagerUser extends User {
  constructor(name, email) {
    super(name, "Manager", email);
    this.color = "#f59e0b";
  }
}

class DeveloperUser extends User {
  constructor(name, email) {
    super(name, "Developer", email);
    this.color = "#6366f1";
  }
}

class TesterUser extends User {
  constructor(name, email) {
    super(name, "Tester", email);
    this.color = "#10b981";
  }
}

class UserFactory {
  static create(role, name, email) {
    switch (role) {
      case "Admin":     return new AdminUser(name, email);
      case "Manager":   return new ManagerUser(name, email);
      case "Developer": return new DeveloperUser(name, email);
      case "Tester":    return new TesterUser(name, email);
      default: throw new Error("Unknown role: " + role);
    }
  }
}


// 3. OBSERVER PATTERN — notifies subscribers when tasks change
class NotificationSystem {
  constructor() {
    this.observers = [];
  }

  subscribe(fn) {
    this.observers.push(fn);
  }

  notify(event, data) {
    this.observers.forEach(fn => fn(event, data));
  }
}

const notifier = new NotificationSystem();


// 4. STRATEGY PATTERN — swappable sorting algorithms
const SortStrategies = {

  manual(tasks) {
    return [...tasks];
  },

  priority(tasks) {
    const rank = { High: 1, Medium: 2, Low: 3 };
    return [...tasks].sort((a, b) => rank[a.priority] - rank[b.priority]);
  },

  deadline(tasks) {
    return [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }
};

class TaskSorter {
  constructor() {
    this.strategyFn = SortStrategies.manual;
  }

  setStrategy(name) {
    this.strategyFn = SortStrategies[name];
  }

  sort(tasks) {
    return this.strategyFn(tasks);
  }
}