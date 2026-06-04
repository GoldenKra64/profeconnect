const { z } = require("zod");
const prisma = require("../lib/prisma");
const publicationService = require("../modules/publications/publication.service");
const { getCategories } = require("../modules/category/category.service");
const { canUserModifyPostTags } = require("./posts-tool-auth");

const CONTENT_TRUNCATE = 2000;

function truncateContent(text, max = CONTENT_TRUNCATE) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function createExecutionContext(overrides = {}) {
  return {
    userId: overrides.userId ?? null,
    role: overrides.role ?? null,
  };
}

async function handlePostsGetFeed(args, ctx) {
  const schema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
    tagIds: z.array(z.coerce.number().int()).optional(),
  });
  const parsed = schema.parse(args ?? {});
  return publicationService.getPublicationFeed({
    page: parsed.page,
    limit: parsed.limit,
    tagIds: parsed.tagIds,
    currentUserId: ctx.userId,
  });
}

async function handlePostsGetById(args, ctx) {
  const schema = z.object({ postId: z.coerce.number().int().positive() });
  const { postId } = schema.parse(args ?? {});
  return publicationService.getPublicationById(postId, ctx.userId);
}

async function handlePostsListTags() {
  const tags = await getCategories();
  return { tags };
}

async function handlePostsClassifyDraft(args) {
  const schema = z.object({
    title: z.string().min(1).max(500),
    content: z.string().min(1),
  });
  const { title, content } = schema.parse(args ?? {});
  const tags = await getCategories();
  return {
    title: title.trim(),
    content: content.trim(),
    availableTags: tags,
  };
}

async function handlePostsApplyTags(args, ctx) {
  const schema = z.object({
    postId: z.coerce.number().int().positive(),
    tagIds: z.array(z.coerce.number().int().positive()).min(1),
  });
  const { postId, tagIds } = schema.parse(args ?? {});

  const existing = await prisma.post.findUnique({
    where: { id: postId },
    include: { tags: true },
  });

  const access = canUserModifyPostTags(existing, ctx);
  if (!access.allowed) {
    const error = new Error(access.message);
    error.statusCode = access.statusCode;
    throw error;
  }

  const foundTags = await prisma.tag.findMany({ where: { id: { in: tagIds } } });
  if (foundTags.length !== tagIds.length) {
    const error = new Error("Una o más etiquetas no existen");
    error.statusCode = 400;
    throw error;
  }

  const isAdmin = ctx.role === "admin";
  const editorId = isAdmin ? existing.authorId : ctx.userId;
  const updated = await publicationService.updatePublication(postId, editorId, {
    tags: tagIds,
  });

  return { post: updated, appliedTagIds: tagIds };
}

async function readPostResource(postId, ctx) {
  const post = await publicationService.getPublicationById(postId, ctx.userId);
  return {
    uri: `post://${postId}`,
    mimeType: "application/json",
    text: JSON.stringify(
      {
        id: post.id,
        title: post.title,
        content: truncateContent(post.content),
        tags: post.tags,
        reactionSummary: post.reactionSummary,
        isAnonymous: post.isAnonymous,
        createdAt: post.createdAt,
      },
      null,
      2
    ),
  };
}

async function readTagsCatalogResource() {
  const tags = await getCategories();
  return {
    uri: "tags://catalog",
    mimeType: "application/json",
    text: JSON.stringify({ tags }, null, 2),
  };
}

const TOOL_HANDLERS = {
  posts_get_feed: handlePostsGetFeed,
  posts_get_by_id: handlePostsGetById,
  posts_list_tags: async () => handlePostsListTags(),
  posts_classify_draft: async (args) => handlePostsClassifyDraft(args),
  posts_apply_tags: handlePostsApplyTags,
};

const TOOL_DEFINITIONS = [
  { name: "posts_get_feed", description: "Feed paginado de publicaciones publicadas." },
  { name: "posts_get_by_id", description: "Detalle de una publicación por ID." },
  { name: "posts_list_tags", description: "Catálogo de etiquetas válidas." },
  { name: "posts_classify_draft", description: "Borrador con catálogo de etiquetas para clasificar." },
  { name: "posts_apply_tags", description: "Aplica etiquetas a un post (autor o admin)." },
];

async function executeTool(name, args, context) {
  const handler = TOOL_HANDLERS[name];
  if (!handler) {
    const error = new Error(`Herramienta MCP desconocida: ${name}`);
    error.statusCode = 400;
    throw error;
  }
  try {
    const result = await handler(args, context ?? createExecutionContext());
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: result,
    };
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: err.message,
            statusCode: err.statusCode ?? 500,
          }),
        },
      ],
    };
  }
}

module.exports = {
  TOOL_DEFINITIONS,
  executeTool,
  createExecutionContext,
  readPostResource,
  readTagsCatalogResource,
};
