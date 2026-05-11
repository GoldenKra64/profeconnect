const categoryService = require("./category.service");
const { ApiResponse } = require("../../config/api.response");

async function getCategories(req, res, next) {
    try {
        const categories = await categoryService.getCategories();

        if (categories.length == 0) {
            const apiResponse = new ApiResponse(false, 404, "No se encontraron categorías");
            return res.status(404).json(apiResponse);
        }

        const apiResponse = new ApiResponse(true, 200, "Categorías obtenidas correctamente", categories);
        return res.status(200).json(apiResponse);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getCategories
}