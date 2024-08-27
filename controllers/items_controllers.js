const db = require("../db/queries.js");
const validation = require("../middleware/validation.js");
const { constraints } = require("../config/config.js");
const { helpersRoutes } = require("../helpers/helpers.js");

async function getAddNewItem(req, res) {
    const parentItems = await getAllParentItems();
    res.render("../views/pages/add_item.ejs", {
        parentItems: parentItems,
        requirements: constraints.addNewItem,
    });
}

async function getUpdateItem(req, res) {
    const parentItems = await getAllParentItems();
    const item = await db.getItem(+req.params.id);
    res.render("../views/pages/update_item.ejs", {
        item: item,
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
        if (!(await isParentItemCategoryIsValid(+req.body.categoryId)))
            return helpersRoutes.renderWrongCategory(req, res, next);
        const errors = validation.validationResult(req);
        if (!errors.isEmpty())
            return helpersRoutes.renderWrongInformationItem(
                req,
                res,
                next,
                errors,
            );
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
    getAddNewItem,
];

async function getSelectedItem(req, res) {
    const item = await db.getItem(req.params.id);
    res.render("../views/pages/show_single_item.ejs", { item: item });
}

async function isParentItemCategoryIsValid(categoryId) {
    // Checking that the category id haven't been messed up on the client side
    const parentItems = await getAllParentItems();
    for (let i = 0; i < parentItems.length; ++i) {
        if (parentItems[i].id === categoryId) return true;
    }
    return false;
}

const postUpdateItem = [
    validation.validateNewItem,
    validation.validateParamId,
    // we should do handle the errors that might get produced in the above code
    async function (req, res, next) {
        const itemId = +req.params.id;
        if (!(await isParentItemCategoryIsValid(+req.body.categoryId)))
            return helpersRoutes.renderWrongCategory(req, res, next);
        const errors = validation.validationResult(req);
        if (!errors.isEmpty())
            helpersRoutes.renderWrongInformationItem(req, res, next);
        // we need to check what fields from the item are actually being updated!
        // we will only perform this at the backend
        const updateInfo = await getUpdateInfo(
            itemId,
            getItemInfoFromHTTPcontainer(itemId, req.body),
        );
        if (Object.keys(updateInfo).length) {
            const keys = Object.keys(updateInfo);
            const values = Object.values(updateInfo);
            await db.updateItem(itemId, keys, values);
        } else {
            res.locals.successUpdateItem = false;
            next();
            return;
        }
        res.locals.successUpdateItem = true;
        next();
    },
    getUpdateItem,
];

function getItemInfoFromHTTPcontainer(id, container) {
    return {
        id: id,
        name: container.name,
        description: container.description,
        price: +container.price,
        quantity: +container.quantity,
        category_id: +container.categoryId,
    };
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

async function getUpdateInfo(itemId, changedInfoItem) {
    const item = await db.getItem(itemId);
    item.price = +item.price;
    const differencesItem = {};
    for (const [key, value] of Object.entries(item)) {
        if (value !== changedInfoItem[key]) {
            differencesItem[key] = changedInfoItem[key];
        }
    }
    return differencesItem;
}

const getDeleteItem = [
    validation.validateParamId,
    async function (req, res, next) {
        const errors = validation.validationResult(req);
        if (!errors.isEmpty()) {
            helpersRoutes.renderWrongInformationItem(req, res, next, errors);
        } else {
            const itemId = +req.params.id;
            let itemDeletedId = await db.deleteItem(itemId);
            if (itemDeletedId) return res.redirect("/items");
            res.locals.itemNotFound = true;
            res.locals.item = undefined;
            res.render("../views/pages/show_single_item.ejs");
        }
    },
];

module.exports = {
    getAllItems,
    getAddNewItem,
    postAddNewItem,
    getSelectedItem,
    getUpdateItem,
    postUpdateItem,
    getDeleteItem,
};
