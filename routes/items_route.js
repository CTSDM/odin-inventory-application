const { Router } = require("express");
const itemsController = require("../controllers/items_controllers");
const router = Router();

router.get("/", itemsController.getAllItems);
router.get("/new", itemsController.getPrintForm);
router.post("/new", itemsController.postAddNewItem);
router.get("/:id", itemsController.getSelectedItem);

module.exports = router;
