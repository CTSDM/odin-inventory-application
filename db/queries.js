const pool = require("./pool.js");
const { env } = require("../config/config.js");
const { helpersDB } = require("../helpers/helpers.js");

async function getMainCategories() {
    // the main categories have NULL parent_id
    const { rows } = await pool.query(
        `SELECT * FROM ${env.database.categoriesTableName}
        WHERE parent_id IS NULL
        ORDER BY id`,
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
        `SELECT * FROM ${env.database.productsTableName}
    WHERE category_id = ${idCategoryQuery}
    ORDER BY id`,
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
        `SELECT * FROM ${env.database.productsTableName};
        ORDER BY id`,
    );
    return rows.length === 0 ? undefined : rows;
}

async function postAddNewItem(
    name,
    description,
    price,
    quantity,
    parentCategory,
) {
    await pool.query(
        `INSERT INTO ${env.database.productsTableName} (name, description, price, quantity, category_id)
                        VALUES ($1,$2,$3,$4,$5)`,
        [name, description, price, quantity, parentCategory],
    );
}

async function updateItem(itemId, columns, values) {
    const queryUpdate = helpersDB.getQueryUpdateItem(columns);
    await pool.query(
        `UPDATE ${env.database.productsTableName} 
        SET ${queryUpdate}
        WHERE id = ${itemId}`,
        values,
    );
}

async function getItem(itemId) {
    // Since a single item is being queried the item object is returned instead of an array
    const { rows } = await pool.query(
        `SELECT * FROM ${env.database.productsTableName} WHERE id = $1`,
        [itemId],
    );
    return rows.length === 0 ? undefined : rows[0];
}

module.exports = {
    getMainCategories,
    getSubCategories,
    getItemsFromCategory,
    getAllCategories,
    getAllItems,
    postAddNewItem,
    getItem,
    updateItem,
};
