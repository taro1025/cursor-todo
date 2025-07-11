// Simple MCP server to aggregate and prioritise tasks
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const TASK_FILE = path.join(__dirname, '..', 'tasks.json');

async function loadTasks() {
  const data = await fs.readFile(TASK_FILE, 'utf8');
  return JSON.parse(data);
}

async function saveTasks(tasks) {
  await fs.writeFile(TASK_FILE, JSON.stringify(tasks, null, 2));
}

async function fetchGmail() {
  const tasks = await loadTasks();
  return tasks.filter(t => t.source === 'gmail');
}

async function fetchSlack() {
  const tasks = await loadTasks();
  return tasks.filter(t => t.source === 'slack');
}

async function fetchCalendar() {
  const tasks = await loadTasks();
  return tasks.filter(t => t.source === 'calendar');
}

async function fetchNotionTasks() {
  const tasks = await loadTasks();
  return tasks.filter(t => t.source === 'notion');
}

async function fetchGitHubIssues() {
  const tasks = await loadTasks();
  return tasks.filter(t => t.source === 'github');
}

function scoreTask(task) {
  const urgency = task.due && (new Date(task.due) - Date.now()) / (1000 * 60 * 60 * 24) < 2 ? 1 : 0;
  const importance = task.labels && task.labels.includes('high-priority') ? 1 : 0;
  return (2 * importance) + urgency;
}

async function getAllTasks() {
  const inputs = [
    ...await fetchGmail(),
    ...await fetchSlack(),
    ...await fetchCalendar(),
    ...await fetchNotionTasks(),
    ...await fetchGitHubIssues()
  ];

  const scored = inputs.map(t => ({ ...t, priority: scoreTask(t) }));
  scored.sort((a, b) => b.priority - a.priority);
  return scored;
}

async function main() {
  const tasks = await getAllTasks();
  console.log('Top tasks:', tasks.slice(0, 10));
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/tasks', async (req, res) => {
    const tasks = await getAllTasks();
    res.json(tasks);
  });

  app.post('/tasks', async (req, res) => {
    const tasks = await loadTasks();
    const newTask = { id: `local-${Date.now()}`, ...req.body };
    tasks.push(newTask);
    await saveTasks(tasks);
    res.status(201).json(newTask);
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`MCP server running on port ${port}`);
  });
}

if (process.env.NODE_ENV === 'test') {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
} else {
  startServer().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
