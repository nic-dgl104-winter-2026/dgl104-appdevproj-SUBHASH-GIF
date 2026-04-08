
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


