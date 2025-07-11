// Task automation script skeleton
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function fetchGmail() {
  // Placeholder: integrate Gmail API
  return [];
}

async function fetchSlack() {
  // Placeholder: integrate Slack API
  return [];
}

async function fetchCalendar() {
  // Placeholder: integrate Google Calendar API
  return [];
}

async function fetchNotionTasks() {
  // Placeholder: integrate Notion API
  return [];
}

async function fetchGitHubIssues() {
  // Placeholder: integrate GitHub API
  return [];
}

function scoreTask(task) {
  const urgency = task.due && (new Date(task.due) - Date.now()) / (1000 * 60 * 60 * 24) < 2 ? 1 : 0;
  const importance = task.labels && task.labels.includes('high-priority') ? 1 : 0;
  return (2 * importance) + urgency;
}

async function main() {
  const inputs = [
    ...await fetchGmail(),
    ...await fetchSlack(),
    ...await fetchCalendar(),
    ...await fetchNotionTasks(),
    ...await fetchGitHubIssues()
  ];

  const scored = inputs.map(t => ({...t, priority: scoreTask(t)}));
  scored.sort((a, b) => b.priority - a.priority);

  console.log('Top tasks:', scored.slice(0, 10));
  // TODO: commit updates back to Notion or GitHub
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
