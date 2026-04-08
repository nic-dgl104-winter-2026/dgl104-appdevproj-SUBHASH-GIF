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

