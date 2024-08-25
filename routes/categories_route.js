const { Router } = require("express");
const categoriesControllers = require("../controllers/categories_controllers");
const router = Router();

router.get("/", categoriesControllers.getMainCategories);
router.get("/:id", categoriesControllers.getSubCategories);
module.exports = router;
