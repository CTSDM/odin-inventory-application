const express = require("express");
const app = express();
const path = require("node:path");
const categoriesRouter = require("./routes/categories_route.js");
const itemsRouter = require("./routes/items_route.js");
const defaultRouter = require("./routes/default_route.js");

const PORT = 5000;
const assetsPath = path.join(__dirname, "public");

app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use("/", defaultRouter);
app.use("/categories", categoriesRouter);
app.use("/items", itemsRouter);

app.listen(PORT, () => console.log(`Server is up on port ${PORT}`));
