const { ApiResponse } = require("../../config/api.response");
const reactionService = require("./reaction.service");

async function upsertReaction(req, res, next) {
  try {
    const postId = Number(req.params.id);
    await reactionService.upsertReaction({
      postId,
      userId: req.user.id,
      type: req.body.type,
    });

    const reactionState = await reactionService.getPostReactionState(postId, req.user.id);

    return res
      .status(200)
      .json(new ApiResponse(true, 200, "Reaccion actualizada correctamente", reactionState));
  } catch (error) {
    next(error);
  }
}

async function deleteReaction(req, res, next) {
  try {
    const postId = Number(req.params.id);
    await reactionService.deleteReaction({
      postId,
      userId: req.user.id,
    });

    const reactionState = await reactionService.getPostReactionState(postId, req.user.id);

    return res
      .status(200)
      .json(new ApiResponse(true, 200, "Reaccion eliminada correctamente", reactionState));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  upsertReaction,
  deleteReaction,
};
