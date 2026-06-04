const { z } = require("zod");
const { chatWithTools, chatCompletionRaw } = require("../../lib/openai");
const { listTools, callTool } = require("../../mcp/mcp-client");
const { mcpToolsToOpenAI } = require("../../mcp/mcp-tools-openai");

const CLASSIFY_SYSTEM_PROMPT = `Eres un asistente de clasificación pedagógica para AmigojoLive (Fe y Alegría).
Sugiere etiquetas SOLO del catálogo proporcionado.
Responde únicamente JSON válido sin markdown:
{"suggestedTagIds":[1],"suggestedTagNames":["Nombre"],"pedagogicalScore":0.0,"rationale":"..."}`;

const FORUM_CHAT_SYSTEM_PROMPT = `Eres el asistente del foro pedagógico AmigojoLive.
Tienes herramientas para leer publicaciones y etiquetas del foro. Úsalas cuando el docente pregunte por posts, publicaciones o contenido del muro.
Mantén el enfoque educativo.`;

const classifyResultSchema = z.object({
  suggestedTagIds: z.array(z.number().int()),
  suggestedTagNames: z.array(z.string()),
  pedagogicalScore: z.number().min(0).max(1).optional(),
  rationale: z.string().optional(),
});

const FORUM_TOOL_NAMES = new Set(["posts_get_feed", "posts_get_by_id", "posts_list_tags"]);
const MAX_ITERATIONS = 5;

async function runAgentLoop({
  messages,
  mcpContext,
  toolFilter,
  systemPrompt,
  maxIterations = MAX_ITERATIONS,
  maxTokens = 1500,
}) {
  const toolsList = await listTools(mcpContext);
  let openAiTools = mcpToolsToOpenAI(toolsList);
  if (toolFilter) {
    openAiTools = openAiTools.filter((t) => toolFilter(t.function.name));
  }

  const conversation = [
    { role: "system", content: systemPrompt },
    ...messages.filter((m) => m.role !== "system"),
  ];

  for (let i = 0; i < maxIterations; i++) {
    const assistantMessage = await chatWithTools({
      messages: conversation,
      tools: openAiTools,
      maxTokens,
      systemPrompt,
    });
    conversation.push(assistantMessage);

    if (!assistantMessage.tool_calls?.length) {
      return { finalMessage: assistantMessage, messages: conversation };
    }

    for (const toolCall of assistantMessage.tool_calls) {
      let fnArgs = {};
      try {
        fnArgs = JSON.parse(toolCall.function.arguments || "{}");
      } catch {
        fnArgs = {};
      }
      let toolResult;
      try {
        toolResult = await callTool(toolCall.function.name, fnArgs, mcpContext);
      } catch (err) {
        toolResult = { error: err.message };
      }
      conversation.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult),
      });
    }
  }

  return { finalMessage: conversation[conversation.length - 1], messages: conversation };
}

function parseClassifyJson(text) {
  const jsonMatch = String(text).trim().match(/\{[\s\S]*\}/);
  return classifyResultSchema.parse(JSON.parse(jsonMatch ? jsonMatch[0] : text));
}

async function classifyWithMcp({ title, content, mcpContext }) {
  const tagCatalog = await callTool("posts_list_tags", {}, mcpContext);
  await callTool("posts_classify_draft", { title, content }, mcpContext);

  const userPrompt = `Clasifica esta publicación.

Título: ${title}
Contenido: ${content}

Catálogo de etiquetas:
${JSON.stringify(tagCatalog.tags ?? tagCatalog, null, 2)}`;

  try {
    const { finalMessage } = await runAgentLoop({
      messages: [{ role: "user", content: userPrompt }],
      mcpContext,
      toolFilter: (name) => name === "posts_list_tags" || name === "posts_classify_draft",
      systemPrompt: CLASSIFY_SYSTEM_PROMPT,
      maxIterations: 3,
      maxTokens: 800,
    });
    const content =
      typeof finalMessage.content === "string"
        ? finalMessage.content
        : JSON.stringify(finalMessage.content);
    return parseClassifyJson(content);
  } catch {
    const fallbackText = await chatCompletionRaw({
      messages: [
        { role: "system", content: CLASSIFY_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 800,
    });
    return parseClassifyJson(fallbackText);
  }
}

async function chatWithForumTools(messages, mcpContext) {
  const { finalMessage } = await runAgentLoop({
    messages,
    mcpContext,
    toolFilter: (name) => FORUM_TOOL_NAMES.has(name),
    systemPrompt: FORUM_CHAT_SYSTEM_PROMPT,
  });
  return finalMessage.content || "No pude generar una respuesta.";
}

module.exports = {
  classifyWithMcp,
  chatWithForumTools,
  classifyResultSchema,
};
