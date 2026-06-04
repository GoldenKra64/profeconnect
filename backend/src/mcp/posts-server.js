#!/usr/bin/env node
/**
 * Servidor MCP stdio solo para desarrollo local (Cursor).
 * No requiere variables nuevas: usa DIRECT_URL/DATABASE_URL del .env.
 */
require("dotenv/config");

const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { createPostsMcpServer } = require("./posts-server-factory");

async function main() {
  const { server } = createPostsMcpServer({ userId: null, role: null });
  await server.connect(new StdioServerTransport());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
