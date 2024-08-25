const db = require("../db/queries");

async function getMainCategories(req, res) {
    const categories = await db.getMainCategories();
    res.render("../views/pages/categories.ejs", { categories: categories });
}

async function getSubCategories(req, res) {
    const { id } = req.params;
    if (id && typeof +id && isFinite(+id)) {
        const categories = await db.getSubCategories(id);
        if (categories) {
            res.render("../views/pages/categories.ejs", {
                categories: categories,
            });
            return;
        } else {
            // if there are no more subcategories we print the items so we render another page
            const items = await db.getItemsFromCategory(id);
            res.render("../views/pages/show_items.ejs", { items: items });
            return;
        }
    }
    res.render("../views/pages/categories.ejs", { categories: undefined });
}

module.exports = { getMainCategories, getSubCategories };
