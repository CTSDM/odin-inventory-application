const pool = require("./pool.js");
const { env } = require("../config/config.js");

async function getMainCategories() {
    // the main categories have NULL parent_id
    const { rows } = await pool.query(
        `SELECT * FROM ${env.database.categoriesTableName}
        WHERE parent_id IS NULL`,
    );
    return rows;
}

async function getSubCategories(idParentQuery) {
    // the sub categories don't NULL parent_id
    const { rows } = await pool.query(
        `SELECT * FROM ${env.database.categoriesTableName}
        WHERE parent_id = ${idParentQuery}`,
    );
    return rows.length === 0 ? undefined : rows;
}

async function getItemsFromCategory(idCategoryQuery) {
    const { rows } = await pool.query(
        `SELECT * FROM ${env.database.productsTableName}
    WHERE category_id = ${idCategoryQuery}`,
    );
    return rows.length === 0 ? undefined : rows;
}

async function getAllCategories() {
    const { rows } = await pool.query(
        `SELECT * FROM ${env.database.categoriesTableName}`,
    );
    return rows;
}

async function getAllItems() {
    const { rows } = await pool.query(
        `SELECT * FROM ${env.database.productsTableName};`,
    );
    return rows.length === 0 ? undefined : rows;
}

module.exports = {
    getMainCategories,
    getSubCategories,
    getItemsFromCategory,
    getAllCategories,
    getAllItems,
};
