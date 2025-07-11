# cursor-todo

This project now exposes a minimal [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for managing tasks. Tasks are stored in `tasks.json` and can be listed or added via MCP resources and tools.

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Edit `tasks.json` to seed any initial tasks. A task looks like the following:

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

Start the MCP streamable HTTP server with:

```bash
npm start
```

The server listens on port `3000` by default. Set the `PORT` environment variable to use a different port, for example `PORT=4000 npm start`.

You should see output similar to:

```
MCP server running on port 3000
```

## Using with an MCP client

Install the [MCP CLI](https://pypi.org/project/mcp-cli/) and register this server with a compatible client such as Claude Desktop:

```bash
# Install the MCP CLI via uv
pip install "mcp-cli[cli]"

# Register the server (node is passed so the CLI runs this file with Node.js)
uv run mcp install node src/index.js
```

For local testing you can also use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npx @modelcontextprotocol/inspector node src/index.js
```

## How it works

The server exposes two MCP features:

- **Resource `tasks://{id}`** – lists all tasks or returns a specific task
- **Tool `add-task`** – creates a new task and saves it to `tasks.json`

Run `npm test` to verify the task file can be read.
