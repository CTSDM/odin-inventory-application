const db = require("../db/queries");
const validation = require("../middleware/validation");
const { constraints } = require("../config/config.js");
const { helpersRoutes } = require("../helpers/helpers.js");

async function getMainCategories(_, res) {
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
            res.locals.subCategories = true;
            next();
        } else {
            // if there are no more subcategories we print the items so we render another page
            const items = await db.getItemsFromCategory(id);
            if (items) {
                res.render("../views/pages/show_items.ejs", { items: items });
            } else {
                res.locals.emptyCategory = true;
                next();
            }
        }
    },
    function (_, res) {
        res.render("../views/pages/categories.ejs");
    },
];

async function getAddCategory(_, res) {
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

const getDeleteCategory = [
    validation.validateNewCategory,
    async function (req, res, _) {
        const categoryId = +req.params.id;
        await db.deleteRelation(undefined, [categoryId]);
        const deletedCategory = await db.deleteCategory(categoryId);
        await db.deleteItemLeftover();
        if (deletedCategory) res.redirect("/");
        else throw new Error("error when deleting category");
    },
];

async function isCategoryValid(categoryId) {
    // Checking that the category id haven't been messed up on the client side
    const categories = await db.getAllCategories();
    for (let i = 0; i < categories.length; ++i)
        if (categories[i].id === categoryId) return true;
    return false;
}

const getUpdateCategory = [
    validation.validateParamId,
    async function (req, res) {
        const categoryId = +req.params.id;
        const category = await db.getCategory(categoryId);
        const categoriesMain = await db.getMainCategories();
        res.locals.category = category;
        res.locals.categories = categoriesMain;
        res.locals.requirements = constraints;
        res.render("../views/pages/update_category.ejs");
    },
];

const postUpdateCategory = [
    validation.validateCategoryId,
    async function (req, res) {
        const categoryId = +req.params.id;
        res.locals.categories = await db.getMainCategories();
        res.locals.requirements = constraints;
        // for now we don't do a thorough check on the front end
        res.locals.updateSuccess = await db.updateCategory(
            categoryId,
            Object.keys(req.body),
            Object.values(req.body),
        );
        res.locals.category = await db.getCategory(categoryId);
        res.render("../views/pages/update_category.ejs");
    },
];

module.exports = {
    getMainCategories,
    getSubCategories,
    getAddCategory,
    postAddCategory,
    getDeleteCategory,
    getUpdateCategory,
    postUpdateCategory,
};
