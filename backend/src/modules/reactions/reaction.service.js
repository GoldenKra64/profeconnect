const prisma = require("../../lib/prisma");

function emptyReactionSummary() {
  return {
    LIKE: 0,
    USEFUL: 0,
    LOVE: 0,
    total: 0,
  };
}

function buildReactionSummary(reactions = []) {
  const summary = emptyReactionSummary();

  for (const reaction of reactions) {
    if (summary[reaction.type] !== undefined) {
      summary[reaction.type] += 1;
      summary.total += 1;
    }
  }

  return summary;
}

function getMyReaction(reactions = [], userId) {
  if (!userId) return null;
  return reactions.find((reaction) => reaction.userId === userId)?.type ?? null;
}

async function assertReactablePost(postId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      deletedAt: true,
      status: true,
    },
  });

  if (!post || post.deletedAt) {
    const error = new Error("Publicacion no encontrada");
    error.statusCode = 404;
    throw error;
  }

  if (post.status !== "PUBLISHED") {
    const error = new Error("No se puede reaccionar a esta publicacion");
    error.statusCode = 400;
    throw error;
  }
}

async function upsertReaction({ postId, userId, type }) {
  await assertReactablePost(postId);

  return prisma.postReaction.upsert({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
    update: {
      type,
    },
    create: {
      postId,
      userId,
      type,
    },
  });
}

async function deleteReaction({ postId, userId }) {
  await assertReactablePost(postId);

  await prisma.postReaction.deleteMany({
    where: {
      postId,
      userId,
    },
  });

  return { postId, userId };
}

async function getPostReactionState(postId, userId) {
  const reactions = await prisma.postReaction.findMany({
    where: { postId },
    select: {
      type: true,
      userId: true,
    },
  });

  return {
    reactionSummary: buildReactionSummary(reactions),
    myReaction: getMyReaction(reactions, userId),
  };
}

module.exports = {
  emptyReactionSummary,
  buildReactionSummary,
  getMyReaction,
  upsertReaction,
  deleteReaction,
  getPostReactionState,
};
