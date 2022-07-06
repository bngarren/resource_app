import express from "express";
import { debug, playerAction, user } from "../controllers";

const router = express.Router();

router.post("/scan", playerAction.scan);

router.get("/debug", debug.showRecent);

// Users routes
router.post("/users/add", user.add);
router.get("/users/:uuid/inventory", user.getInventoryItemsForUser);

export default router;
