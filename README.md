[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/R5_Sso5O)
# DGL 104 - Task Management System (TMS)

## Introduction

A web-based Task Management System built individually for DGL 104 - Application Development at North Island College. The app allows users to create, assign, track, and manage tasks using HTML, CSS, and JavaScript. All data is stored in the browser's localStorage — no backend server is required.

## Tech Stack

- HTML
- CSS
- JavaScript
- Chart.js (doughnut chart on the dashboard)
- GitHub Actions (CI/CD pipeline)
- GitHub Pages (deployment)

## Unique Features

- **Kanban, List & Calendar Views** — three ways to visualize tasks
- **Role-Based Login** — Admin, Manager, Developer and Tester each get a different colour badge
- **Live Toast Notifications** — a message appears every time a task is created, updated or deleted
- **Smart Task Sorting** — sort tasks by manual order, priority, or deadline using the Strategy pattern
- **Overdue Highlighting** — tasks past their due date are flagged in red
- **Persistent Storage** — all tasks survive a page refresh via localStorage
- **Doughnut Chart** — live visual breakdown of task statuses on the dashboard

## Design Patterns

### 1. Singleton Pattern — `TaskDatabase`
Only one database instance ever exists. Every part of the app reads and writes to the same object, preventing data from getting out of sync.

### 2. Factory Pattern — `UserFactory`
Creates the correct user object based on the role selected at login. Calling `UserFactory.create("Admin", name, email)` returns an `AdminUser` with the right colour badge.

### 3. Observer Pattern — `NotificationSystem`
When a task is created, updated or deleted, the `notifier` automatically calls all subscribed functions. This triggers the toast notification without the task code needing to know about the UI.

### 4. Strategy Pattern — `TaskSorter`
The sorting algorithm can be swapped at runtime using the dropdown in the toolbar. Three strategies are available: Manual, Priority, and Deadline.

## Installation Guidelines

No installation or server setup required.

**Run locally:**
1. Clone the repository:
```bash
   git clone https://github.com/YOUR-USERNAME/dgl104-appdevproj-YOUR-USERNAME.git
```
2. Open `index.html` in your browser.

**View live:**
> https://YOUR-USERNAME.github.io/dgl104-appdevproj-YOUR-USERNAME

## Summary of the Project

The TMS was built across Phases 1 and 2 of DGL 104. Phase 1 covered setting up the repository, implementing CRUD operations, and integrating the four design patterns. Phase 2 added the Kanban, List and Calendar views, the Chart.js dashboard, responsive styling, and deployment via GitHub Actions to GitHub Pages.

The code is split into three files — `patterns.js` for design patterns, `taskManager.js` for data operations, and `app.js` for rendering and events — keeping each file focused on one responsibility.

## Contributions

Individual project

| Tasks completed
|------
| Project setup and GitHub repository
| Task CRUD (Create, Read, Update, Delete)
| Singleton Pattern
| Factory Pattern
| Observer Pattern
| Strategy Pattern
| Kanban Board View
| List View
| Calendar View
| Dashboard Stats and Chart.js
| Responsive UI 
| CI/CD Pipeline (GitHub Actions)
| Deployment (GitHub Pages)

## References

- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [MDN Web Docs — localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Refactoring Guru — Design Patterns](https://refactoring.guru/design-patterns)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- DGL 104 Course Material — North Island College
