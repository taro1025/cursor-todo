# cursor-todo

This project contains a tiny MCP (master control program) style server that
consolidates tasks from multiple sources. Tasks are stored in a local
`tasks.json` file and ranked by urgency and importance.

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Edit `tasks.json` to seed any initial tasks. A task looks like the
   following:

   ```json
   {
     "id": "gmail-1",
     "title": "Reply to project email",
     "due": "2024-07-01",
     "labels": ["high-priority"],
     "source": "gmail"
   }
   ```

## Running the server

Start the server with:

```bash
npm start
```

The server listens on port `3000` by default. Set the `PORT` environment
variable to use a different port, for example `PORT=4000 npm start`.

You should see output similar to the following when the server is running:

```
MCP server running on port 3000
```

## API

### `GET /tasks`

Returns the aggregated task list sorted by priority.

```bash
curl http://localhost:3000/tasks
```

### `POST /tasks`

Adds a new task to `tasks.json`.

```bash
curl -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Check Slack messages","source":"slack"}'
```

The server assigns an `id` and returns the created task in the response:

```json
{
  "id": "local-16252312231",
  "title": "Check Slack messages",
  "source": "slack"
}
```

## Prioritisation

Tasks are scored using a very small heuristic:

- Items tagged with `high-priority` are deemed more important.
- Tasks with a due date within two days are considered more urgent.

The `/tasks` endpoint returns items ordered by this score so that the most
pressing tasks appear first.

---

Run `npm test` if you want to execute the prioritisation logic once without
starting the server.
