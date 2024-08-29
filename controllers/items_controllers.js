const db = require("../db/queries.js");
const validation = require("../middleware/validation.js");
const { constraints } = require("../config/config.js");
const { helpersRoutes } = require("../helpers/helpers.js");

async function getAddNewItem(req, res) {
    const subCategories = await db.getAllSubCategories();
    res.render("../views/pages/add_item.ejs", {
        subCategories: subCategories,
        requirements: constraints,
    });
}

async function getUpdateItem(req, res) {
    const subCategories = await db.getAllSubCategories();
    const itemId = +req.params.id;
    const relationItemCategory = await db.getCategoriesFromItems(itemId);
    const item = await db.getItem(itemId);
    res.render("../views/pages/update_item.ejs", {
        item: item,
        subCategories: subCategories,
        requirements: constraints,
        relatedCategories: relationItemCategory,
    });
}

async function getAllItems(req, res) {
    const allItems = await db.getAllItems();
    res.render("../views/pages/show_items.ejs", { items: allItems });
}

const postAddNewItem = [
    validation.validateItemFields,
    validation.validateItemCategories,
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

const postUpdateItem = [
    validation.validateItemFields,
    validation.validateItemCategories,
    validation.validateParamId,
    // we should do handle the errors that might get produced in the above code
    async function (req, res, next) {
        const itemId = +req.params.id;
        const errors = validation.validationResult(req);
        if (!errors.isEmpty())
            return helpersRoutes.renderWrongInformation(req, res, next, errors);
        // we need to check what fields from the item are actually being updated!
        // we will only perform this at the backend
        const categories = req.body.categories;
        const updateInfo = await getUpdateInfo(
            itemId,
            getItemInfoFromHTTPcontainer(itemId, req.body),
            categories,
        );
        let changes = false;
        if (Object.keys(updateInfo.item).length > 0) {
            const keys = Object.keys(updateInfo.item);
            const values = Object.values(updateInfo.item);
            await db.updateItem(itemId, keys, values);
            changes = true;
        }
        if (updateInfo.categoriesDel.length > 0) {
            changes = true;
            await db.deleteRelation([itemId], updateInfo.categoriesDel);
        }
        if (updateInfo.categories.length > 0) {
            changes = true;
            await db.addRelation([itemId], updateInfo.categories);
        }
        if (changes === false) {
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

async function getUpdateInfo(itemId, changedInfoItem, changedCategories) {
    const item = await db.getItem(itemId);
    item.price = +item.price;
    const differencesItem = { item: {}, categories: [], categoriesDel: [] };
    // checking item fields differences
    for (const [key, value] of Object.entries(item)) {
        if (value !== changedInfoItem[key]) {
            differencesItem.item[key] = changedInfoItem[key];
        }
    }
    // checking changes on the categories
    const categoriesRelation = await db.getCategoriesFromItems(itemId);
    const objectCategoriesRelation = getObjectFromArrayIndexes(
        categoriesRelation.map((obj) => obj["category_id"]),
    );
    const objectCategoriesChanged =
        getObjectFromArrayIndexes(changedCategories);
    for (const [key, value] of Object.entries(objectCategoriesChanged)) {
        if (value !== objectCategoriesRelation[key]) {
            differencesItem.categories.push(+key);
        }
        delete objectCategoriesRelation[key];
    }
    for (const [key, _] of Object.entries(objectCategoriesRelation)) {
        differencesItem.categoriesDel.push(+key);
    }
    return differencesItem;
}

function getObjectFromArrayIndexes(arrIndexes) {
    const objectIndexes = {};
    arrIndexes.forEach((index) => (objectIndexes[index] = true));
    return objectIndexes;
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
