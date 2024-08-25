const env = {
	database: {
		categoriesTableName: process.env.TABLE_CATEGORY_NAME,
		productsTableName: process.env.TABLE_PRODUCT_NAME,
		url: process.env.DATABASE_URL,
	},
};

module.exports = { env };
