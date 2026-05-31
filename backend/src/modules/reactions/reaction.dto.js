const { z } = require("zod");

const reactionTypes = ["LIKE", "USEFUL", "LOVE"];

const upsertReactionDto = z.object({
  type: z.enum(reactionTypes),
});

module.exports = {
  reactionTypes,
  upsertReactionDto,
};
