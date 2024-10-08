const { Router } = require("express");
const categoriesControllers = require("../controllers/categories_controllers");
const router = Router();

router.get("/", categoriesControllers.getMainCategories);
router.get("/new", categoriesControllers.getAddCategory);
router.post("/new", categoriesControllers.postAddCategory);
router.get("/:id", categoriesControllers.getSubCategories);
router.get("/:id/delete", categoriesControllers.getDeleteCategory);
router.get("/:id/update", categoriesControllers.getUpdateCategory);
router.post("/:id/update", categoriesControllers.postUpdateCategory);
module.exports = router;
