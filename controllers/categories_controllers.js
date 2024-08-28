const db = require("../db/queries");
const validation = require("../middleware/validation");
const { constraints } = require("../config/config.js");
const { helpersRoutes } = require("../helpers/helpers.js");
const { getAddNewItem } = require("./items_controllers.js");

async function getMainCategories(req, res) {
    const categories = await db.getMainCategories();
    res.render("../views/pages/categories.ejs", { categories: categories });
}

const getSubCategories = [
    validation.validateParamId,
    async function (req, res, next) {
        const errors = validation.validationResult(req);
        if (!errors.isEmpty())
            helpersRoutes.renderWrongInformation(req, res, next, errors);
        const { id } = req.params;
        const categories = await db.getSubCategories(id);
        if (categories) {
            res.locals.categories = categories;
            next();
        } else {
            // if there are no more subcategories we print the items so we render another page
            const items = await db.getItemsFromCategory(id);
            if (items) {
                res.render("../views/pages/show_items.ejs", { items: items });
            } else {
                next();
            }
        }
    },
    function (req, res) {
        res.render("../views/pages/categories.ejs");
    },
];

async function getAddCategory(req, res) {
    const categories = await db.getMainCategories();
    res.render("../views/pages/add_category.ejs", {
        categories: categories,
        requirements: constraints,
    });
}

const postAddCategory = [
    validation.validateNewCategory,
    async function (req, res, next) {
        if (!(await isCategoryValid(+req.body.categoryId)))
            return helpersRoutes.renderWrongCategory(req, res, next);
        const errors = validation.validationResult(req);
        if (!errors.isEmpty()) {
            return helpersRoutes.renderWrongInformation(req, res, next);
        } else {
            await db.addCategory(req.body.name, req.body.categoryId);
            res.locals.successAddNewCategory = "true";
            next();
        }
    },
    getAddCategory,
];

async function isCategoryValid(categoryId) {
    // Checking that the category id haven't been messed up on the client side
    const categories = await db.getAllCategories();
    for (let i = 0; i < categories.length; ++i)
        if (categories[i].id === categoryId) return true;
    return false;
}

module.exports = {
    getMainCategories,
    getSubCategories,
    getAddCategory,
    postAddCategory,
};
