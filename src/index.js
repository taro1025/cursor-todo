import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TASK_FILE = path.join(__dirname, '..', 'tasks.json');

async function loadTasks() {
  const data = await fs.readFile(TASK_FILE, 'utf8');
  return JSON.parse(data);
}

async function saveTasks(tasks) {
  await fs.writeFile(TASK_FILE, JSON.stringify(tasks, null, 2));
}

function createServer() {
  const server = new McpServer({ name: 'task-server', version: '1.0.0' });

  server.registerResource(
    'tasks',
    new ResourceTemplate('tasks://{id}', { list: undefined }),
    {
      title: 'Task Resource',
      description: 'Retrieve all tasks or a specific task by id'
    },
    async (uri, { id }) => {
      const tasks = await loadTasks();
      if (id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return { contents: [] };
        return { contents: [{ uri: uri.href, text: JSON.stringify(task, null, 2) }] };
      }
      return { contents: [{ uri: uri.href, text: JSON.stringify(tasks, null, 2) }] };
    }
  );

  server.registerTool(
    'add-task',
    {
      title: 'Add Task',
      description: 'Create a new task',
      inputSchema: { title: z.string(), source: z.string() }
    },
    async ({ title, source }) => {
      const tasks = await loadTasks();
      const newTask = { id: `local-${Date.now()}`, title, source };
      tasks.push(newTask);
      await saveTasks(tasks);
      return { content: [{ type: 'text', text: JSON.stringify(newTask) }] };
    }
  );

  return server;
}

function createApp() {
  const app = express();
  app.use(express.json());

  app.post('/mcp', async (req, res) => {
    try {
      const server = createServer();
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on('close', () => {
        transport.close();
        server.close();
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error('Error handling MCP request:', err);
      if (!res.headersSent) {
        res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null });
      }
    }
  });

  const methodNotAllowed = (req, res) => {
    res.writeHead(405).end(JSON.stringify({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed.' },
      id: null
    }));
  };

  app.get('/mcp', methodNotAllowed);
  app.delete('/mcp', methodNotAllowed);

  return app;
}

if (process.env.NODE_ENV === 'test') {
  const tasks = await loadTasks();
  console.log(`Loaded ${tasks.length} tasks`);
} else {
  const app = createApp();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`MCP server running on port ${port}`);
  });
}
