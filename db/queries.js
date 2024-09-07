const pool = require("./pool.js");
const { env } = require("../config/config.js");
const { helpersDB } = require("../helpers/helpers.js");
const helpers = require("../helpers/helpers.js");

async function addCategory(name, parentId) {
    await pool.query(
        `INSERT INTO ${env.database.categoriesTableName}
        (name, parent_id)
        VALUES($1, $2)`,
        [name, parentId],
    );
}

async function getCategory(id) {
    const { rows } = await pool.query(
        `SELECT * FROM ${env.database.categoriesTableName}
        WHERE id = $1`,
        [id],
    );
    return rows[0];
}

async function getMainCategories() {
    // the main categories have NULL parent_id
    const { rows } = await pool.query(
        `SELECT * FROM ${env.database.categoriesTableName}
        WHERE parent_id IS NULL
        ORDER BY id;`,
    );
    return rows;
}

async function getAllSubCategories() {
    const { rows } = await pool.query(
        `SELECT * FROM ${env.database.categoriesTableName}
    WHERE parent_id IS NOT NULL
    ORDER BY id;
    `,
    );
    return rows;
}

async function getSubCategories(idParentQuery) {
    // the sub categories don't NULL parent_id
    const { rows } = await pool.query(
        `SELECT * FROM ${env.database.categoriesTableName}
        WHERE parent_id = ${idParentQuery}
        ORDER BY id`,
    );
    return rows.length === 0 ? undefined : rows;
}

async function getItemsFromCategory(idCategoryQuery) {
    const { rows } = await pool.query(
        `SELECT items.* FROM ${env.database.itemsTableName} as items
        JOIN ${env.database.itemsCategoriesTableName} as relationship ON relationship.item_id = items.id
        WHERE relationship.category_id = $1
        ORDER BY items.id;`,
        [idCategoryQuery],
    );
    return rows.length === 0 ? undefined : rows;
}

async function getAllCategories() {
    const { rows } = await pool.query(
        `SELECT * FROM ${env.database.categoriesTableName}
        ORDER BY id`,
    );
    return rows;
}

async function getAllItems() {
    const { rows } = await pool.query(
        `SELECT * FROM ${env.database.itemsTableName}
        ORDER BY id;`,
    );
    return rows.length === 0 ? undefined : rows;
}

async function addNewItem(name, description, price, quantity) {
    const { rows } = await pool.query(
        `INSERT INTO ${env.database.itemsTableName} (name, description, price, quantity)
        VALUES ($1,$2,$3,$4)
        RETURNING id;`,
        [name, description, price, quantity],
    );
    return rows[0];
}

async function updateItem(itemId, columns, values) {
    console.log(columns);
    const queryUpdate = helpersDB.getQueryUpdateItem(columns);
    await pool.query(
        `UPDATE ${env.database.itemsTableName} 
        SET ${queryUpdate}
        WHERE id = ${itemId}`,
        values,
    );
}

async function updateCategory(categoryId, columns, values) {
    const queryUpdate = helpersDB.getQueryUpdateItem(columns);
    const { rows } = await pool.query(
        `UPDATE ${env.database.categoriesTableName}
        SET ${queryUpdate}
        WHERE id = ${categoryId}
        RETURNING id`,
        values,
    );
    return rows.length === 0 ? false : true;
}

async function getItem(itemId) {
    // Since a single item is being queried the item object is returned instead of an array
    const { rows } = await pool.query(
        `SELECT * FROM ${env.database.itemsTableName} WHERE id = $1`,
        [itemId],
    );
    return rows.length === 0 ? undefined : rows[0];
}

async function deleteItem(id) {
    const { rows } = await pool.query(
        `DELETE FROM  ${env.database.itemsTableName}
        WHERE id = $1
        RETURNING id`,
        [id],
    );
    return rows.length === 0 ? false : true;
}

async function addRelationship(querySQL, valuesArr) {
    return await pool.query(
        `INSERT INTO ${env.database.itemsCategoriesTableName} (item_id, category_id)
        VALUES ${querySQL}
        RETURNING *`,
        valuesArr,
    );
}

async function addRelation(items, categories) {
    const queryDetails = helpers.helpersDB.getQueryAddRelation(
        items,
        categories,
    );

    const { rows } = await pool.query(
        `INSERT INTO ${env.database.itemsCategoriesTableName}
        ${queryDetails[0]}
        RETURNING *`,
        queryDetails[1],
    );

    return rows;
}

async function deleteRelation(items, categories) {
    // both items are categories must be arrays
    // only one will have a length larger than 1
    // getQueryRemoveRelation(items, categories);
    const queryDetails = helpers.helpersDB.getQueryDeleteRelation(
        items,
        categories,
    );
    const { rows } = await pool.query(
        `DELETE FROM ${env.database.itemsCategoriesTableName}
        WHERE ${queryDetails[0]}
        RETURNING *;`,
        queryDetails[1],
    );
    return rows;
}

async function getCategoriesFromItems(itemId) {
    const { rows } = await pool.query(
        `SELECT category_id FROM ${env.database.itemsCategoriesTableName}
        WHERE item_id = $1;`,
        [itemId],
    );
    return rows.length === 0 ? undefined : rows;
}

async function deleteCategory(categoryId) {
    const { rows } = await pool.query(
        `DELETE FROM ${env.database.categoriesTableName}
        WHERE id = $1
        RETURNING *;`,
        [categoryId],
    );
    return rows[0];
}

async function deleteItemLeftover() {
    await pool.query(
        `
        DELETE FROM ${env.database.itemsTableName}
        WHERE id NOT IN (SELECT DISTINCT item_id FROM  ${env.database.itemsCategoriesTableName});
    `,
    );
}

module.exports = {
    getMainCategories,
    getSubCategories,
    getItemsFromCategory,
    getAllCategories,
    getAllItems,
    addNewItem,
    getItem,
    updateItem,
    deleteItem,
    addCategory,
    getAllSubCategories,
    addRelationship,
    getCategoriesFromItems,
    deleteRelation,
    addRelation,
    deleteCategory,
    deleteItemLeftover,
    getCategory,
    updateCategory,
};
