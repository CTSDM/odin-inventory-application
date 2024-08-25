const db = require("../db/queries.js");
const validation = require("../middleware/validation.js");
const { constraints } = require("../config/config.js");

async function getPrintForm(req, res) {
    const parentItems = await getAllParentItems();
    res.render("../views/pages/add_item.ejs", {
        parentItems: parentItems,
        requirements: constraints.addNewItem,
    });
}

async function getAllItems(req, res) {
    const allItems = await db.getAllItems();
    res.render("../views/pages/show_items.ejs", { items: allItems });
}

const postAddNewItem = [
    validation.validateNewItem,
    async function (req, res, next) {
        if (!isParentItemCategoryIsValid(+req.body.categoryId)) {
            res.locals.errors = [
                {
                    msg: "The category id was not found or it is not correct.",
                },
            ];
            res.status(400);
            return next();
        }

        const errors = validation.validationResult(req);
        if (!errors.isEmpty()) {
            res.locals.errors = errors.array();
            res.status(400);
            return next();
        }
        db.postAddNewItem(
            req.body.name,
            req.body.description,
            req.body.price,
            req.body.quantity,
            req.body.categoryId,
        );
        res.locals.successAddNewItem = true;
        next();
    },
    getPrintForm,
];

async function getSelectedItem(req, res) {
    const item = await db.getItem(req.params.id);
    res.render("../views/pages/show_single_item.ejs", { item: item[0] });
}

async function isParentItemCategoryIsValid(categoryId) {
    // Checking that the category id haven't been messed up on the client side
    const parentItems = await getAllParentItems();
    for (let i = 0; i < parentItems.length; ++i) {
        if (parentItems[i].id === categoryId) return true;
    }
    return false;
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

module.exports = { getAllItems, getPrintForm, postAddNewItem, getSelectedItem };
