const prisma = require("../../lib/prisma");

async function getCategories() {
    const categories = await prisma.tag.findMany({
        orderBy: {
            name: "asc"
        }
    });

    return categories;
}

module.exports = {
    getCategories
}