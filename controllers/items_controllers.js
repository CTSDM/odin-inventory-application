const db = require("../db/queries.js");

async function getPrintForm(req, res) {
    const parentItems = await getAllParentItems();
    res.render("../views/pages/add_item.ejs", { parentItems: parentItems });
}

async function getAllItems(req, res) {
    const allItems = await db.getAllItems();
    res.render("../views/pages/show_items.ejs", { items: allItems });
}

async function getAllParentItems() {
    // we return all the categories that have no categories underneath
    // these categories only have items
    const allCategories = await db.getAllCategories();
    const parentItems = allCategories.filter((category) => {
        for (let i = 0; i < allCategories.length; ++i) {
            if (category.parent_id === allCategories[i].id) return true;
        }
        return false;
    });
    return parentItems;
}

module.exports = { getAllItems, getPrintForm };
