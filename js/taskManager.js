class TaskManager {
  constructor() {
    // Use the Singleton database
    this.db = new TaskDatabase();
    this.tasks = this.db.load();
  }

  // CREATE — adds a new task to the array and saves it
  create(data) {
    const task = {
      id:          Date.now().toString(),
      title:       data.title,
      description: data.description || "",
      assignedTo:  data.assignedTo  || "",
      priority:    data.priority    || "Medium",
      status:      data.status      || "To Do",
      dueDate:     data.dueDate     || "",
      tags:        data.tags        || [],
      reminder:    data.reminder    || "",
      createdAt:   new Date().toISOString(),
    };

    this.tasks.push(task);  
    this.db.save(this.tasks); 
    notifier.notify("task_created", task);
    return task;
  }

  // READ ALL — returns the full tasks array
  getAll() {
    return this.tasks;
  }

  // READ ONE — finds a single task by its id
  getById(id) {
    return this.tasks.find(task => task.id === id);
  }

  // UPDATE — merges new data into an existing task
  update(id, changes) {
    const task = this.getById(id);
    if (!task) return null;
    Object.assign(task, changes);
    this.db.save(this.tasks);
    notifier.notify("task_updated", task);
    return task;
  }

  // DELETE — removes a task from the array by id
  remove(id) {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.db.save(this.tasks);
    notifier.notify("task_deleted", null);
  }

  // SAVE — used by undo/redo to force a save
  save() {
    this.db.save(this.tasks);
  }

  // STATS — counts for the dashboard cards
  getStats() {
    return {
      total:      this.tasks.length,
      todo:       this.tasks.filter(t => t.status === "To Do").length,
      inProgress: this.tasks.filter(t => t.status === "In Progress").length,
      completed:  this.tasks.filter(t => t.status === "Completed").length,
      high:       this.tasks.filter(t => t.priority === "High").length,
    };
  }
}