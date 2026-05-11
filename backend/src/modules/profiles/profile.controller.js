const profileService = require("./profile.service");
const { ApiResponse } = require("../../config/api.response");

async function getMyProfile(req, res, next) {
  try {
    const profile = await profileService.getMyProfile(req.user.id);

    const apiResponse = new ApiResponse(true, 200, "Perfil obtenido correctamente", profile);
    return res.status(200).json(apiResponse);
  } catch (error) {
    next(error);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const profile = await profileService.updateMyProfile(
      req.user.id,
      req.body
    );

    return res.status(200).json(new ApiResponse(true, 200, "Perfil actualizado correctamente", profile));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
};