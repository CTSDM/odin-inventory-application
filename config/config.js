const env = {
    database: {
        categoriesTableName: process.env.TABLE_CATEGORY_NAME,
        productsTableName: process.env.TABLE_PRODUCT_NAME,
        url: process.env.DATABASE_URL,
    },
};

const constraints = {
    addNewItem: {
        item: {
            maxLength: 40,
            minLength: 2,
        },
        category: {
            maxLength: 25,
            minLength: 4,
        },
        description: {
            maxLength: 255,
            minLength: 5,
        },
        price: {
            min: 5,
            max: 4999,
            step: 0.01,
        },
        quantity: {
            min: 5,
            max: 999,
        },
    },
};

module.exports = { env, constraints };
