const { Router } = require("express");
const itemsController = require("../controllers/items_controllers");
const router = Router();

router.get("/", itemsController.getAllItems);
router.get("/new", itemsController.getAddNewItem);
router.post("/new", itemsController.postAddNewItem);
router.get("/:id", itemsController.getSelectedItem);
router.get("/:id/update", itemsController.getUpdateItem);
router.post("/:id/update", itemsController.postUpdateItem);
router.get("/:id/delete", itemsController.getDeleteItem);

module.exports = router;
