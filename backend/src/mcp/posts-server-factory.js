const { McpServer, ResourceTemplate } = require("@modelcontextprotocol/sdk/server/mcp.js");
const {
  TOOL_DEFINITIONS,
  createExecutionContext,
  executeTool,
  readPostResource,
  readTagsCatalogResource,
} = require("./posts-tool-handlers");
const { z } = require("zod");

const toolSchemas = {
  posts_get_feed: {
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(50).optional(),
    tagIds: z.array(z.number().int()).optional(),
  },
  posts_get_by_id: { postId: z.number().int().positive() },
  posts_list_tags: {},
  posts_classify_draft: { title: z.string().min(1), content: z.string().min(1) },
  posts_apply_tags: {
    postId: z.number().int().positive(),
    tagIds: z.array(z.number().int().positive()).min(1),
  },
};

function createPostsMcpServer(context = {}) {
  const execContext = createExecutionContext(context);
  const server = new McpServer(
    { name: "amigojolive-posts", version: "1.0.0" },
    { capabilities: { tools: {}, resources: {} } }
  );

  for (const tool of TOOL_DEFINITIONS) {
    server.registerTool(
      tool.name,
      {
        title: tool.name,
        description: tool.description,
        inputSchema: toolSchemas[tool.name],
      },
      async (args) => executeTool(tool.name, args, execContext)
    );
  }

  server.registerResource(
    "post",
    new ResourceTemplate("post://{postId}", { list: undefined }),
    { title: "Publicación", description: "Resumen de publicación" },
    async (_uri, variables) => ({
      contents: [await readPostResource(Number(variables.postId), execContext)],
    })
  );

  server.registerResource(
    "tags-catalog",
    "tags://catalog",
    { title: "Etiquetas", description: "Catálogo de etiquetas" },
    async () => ({ contents: [await readTagsCatalogResource()] })
  );

  return { server, execContext };
}

module.exports = { createPostsMcpServer };
