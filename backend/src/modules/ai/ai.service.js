const { callTool } = require("../../mcp/mcp-client");
const { classifyWithMcp } = require("./ai.orchestrator");

function buildMcpContext(user) {
  return { userId: user?.id ?? null, role: user?.role ?? null };
}

async function classifyPublication({ title, content, postId, applyTags, user }) {
  if (!process.env.CHATBOT_API_KEY?.trim()) {
    const error = new Error("CHATBOT_API_KEY no está configurada en el servidor");
    error.statusCode = 503;
    throw error;
  }

  const mcpContext = buildMcpContext(user);
  const classification = await classifyWithMcp({ title, content, mcpContext });
  const catalog = await callTool("posts_list_tags", {}, mcpContext);
  const tagById = new Map((catalog.tags ?? catalog ?? []).map((t) => [t.id, t.name]));
  const validIds = new Set(tagById.keys());
  const filteredTagIds = (classification.suggestedTagIds ?? []).filter((id) => validIds.has(id));

  const suggestedTags = filteredTagIds.map((id) => ({
    id,
    name: tagById.get(id) ?? null,
  }));

  let applied = false;
  let post = null;

  if (applyTags && postId && filteredTagIds.length) {
    const applyResult = await callTool(
      "posts_apply_tags",
      { postId, tagIds: filteredTagIds },
      mcpContext
    );
    applied = true;
    post = applyResult.post ?? applyResult;
  }

  return {
    suggestedTags,
    pedagogicalScore: classification.pedagogicalScore ?? null,
    rationale: classification.rationale ?? null,
    applied,
    post,
  };
}

module.exports = { classifyPublication, buildMcpContext };
