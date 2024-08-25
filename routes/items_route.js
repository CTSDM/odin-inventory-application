const { Router } = require("express");
const itemsController = require("../controllers/items_controllers");
const router = Router();

router.get("/", itemsController.getAllItems);
router.get("/new", itemsController.getPrintForm);
//router.post("/new", itemsController.getPrintForm);
//router.get("/:id", itemsController.getAllParentItems);

module.exports = router;
