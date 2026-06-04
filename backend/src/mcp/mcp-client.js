const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { createLinkedTransportPair } = require("./linked-transport");
const { createPostsMcpServer } = require("./posts-server-factory");
const { executeTool, TOOL_DEFINITIONS } = require("./posts-tool-handlers");
const { parseToolResultContent } = require("./mcp-tools-openai");

let embeddedClient = null;
let embeddedKey = null;

async function connectEmbedded(context) {
  const { clientTransport, serverTransport } = createLinkedTransportPair();
  const { server } = createPostsMcpServer(context);
  await server.connect(serverTransport);

  const client = new Client(
    { name: "amigojolive-api", version: "1.0.0" },
    { capabilities: {} }
  );
  await client.connect(clientTransport);
  return client;
}

async function getMcpClient(context = {}) {
  const key = `${context.userId ?? "anon"}:${context.role ?? ""}`;
  if (embeddedClient && embeddedKey === key) {
    return embeddedClient;
  }
  if (embeddedClient) {
    try {
      await embeddedClient.close();
    } catch {
      /* ignore */
    }
  }
  embeddedClient = await connectEmbedded(context);
  embeddedKey = key;
  return embeddedClient;
}

async function listTools(context) {
  const client = await getMcpClient(context);
  return client.listTools();
}

async function callTool(name, args, context = {}) {
  const result = await executeTool(name, args, {
    userId: context.userId ?? null,
    role: context.role ?? null,
  });
  if (result.isError) {
    const parsed = parseToolResultContent(result);
    const err = new Error(parsed?.error ?? "Error en herramienta MCP");
    err.statusCode = parsed?.statusCode ?? 500;
    throw err;
  }
  return parseToolResultContent(result);
}

async function readResource(uri, context = {}) {
  const client = await getMcpClient(context);
  const result = await client.readResource({ uri });
  const text = result.contents?.[0]?.text;
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

module.exports = {
  listTools,
  callTool,
  readResource,
  TOOL_DEFINITIONS,
};
