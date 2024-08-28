const db = require("../db/queries.js");
const validation = require("../middleware/validation.js");
const { constraints } = require("../config/config.js");
const { helpersRoutes } = require("../helpers/helpers.js");

async function getAddNewItem(req, res) {
    const parentItems = await db.getAllSubCategories();
    res.render("../views/pages/add_item.ejs", {
        parentItems: parentItems,
        requirements: constraints,
    });
}

async function getUpdateItem(req, res) {
    const parentItems = await db.getAllSubCategories();
    const item = await db.getItem(+req.params.id);
    res.render("../views/pages/update_item.ejs", {
        item: item,
        parentItems: parentItems,
        requirements: constraints,
    });
}

async function getAllItems(req, res) {
    const allItems = await db.getAllItems();
    res.render("../views/pages/show_items.ejs", { items: allItems });
}

const postAddNewItem = [
    validation.validateNewItem,
    async function (req, res, next) {
        const errors = validation.validationResult(req);
        if (!errors.isEmpty())
            return helpersRoutes.renderWrongInformation(req, res, next, errors);
        // we first try to add the relationship item-category
        // for now, we won't check the validity categories id
        // we will assume that it wasn't messed up on the client side
        const newItemObj = await db.addNewItem(
            req.body.name,
            req.body.description,
            +req.body.price,
            +req.body.quantity,
        );
        const categories = req.body.categories.map((x) => +x);
        const paramsSQL = getParamsSQLAddRelation(newItemObj.id, categories);
        await db.addRelationship(paramsSQL[0], paramsSQL[1]);
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
    const parentItems = await db.getAllSubCategories();
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
            return helpersRoutes.renderWrongInformation(req, res, next);
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
            return next();
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
    };
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
            helpersRoutes.renderWrongInformation(req, res, next, errors);
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

function getParamsSQLAddRelation(itemId, categoriesIdArr) {
    const query = [];
    const values = [];
    const multiplier = 2;
    categoriesIdArr.forEach((categoryId, index) => {
        values.push(itemId, categoryId);
        query.push(`($${index * multiplier + 1}, $${index * multiplier + 2})`);
    });
    return [query.join(", "), values];
}

module.exports = {
    getAllItems,
    getAddNewItem,
    postAddNewItem,
    getSelectedItem,
    getUpdateItem,
    postUpdateItem,
    getDeleteItem,
};
