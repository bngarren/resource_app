import express from "express";
import { debug, playerAction, user } from "../controllers";

const router = express.Router();

router.post("/scan", playerAction.scan);

router.get("/debug", debug.showRecent);

// Users routes
router.get("/users/:uuid", user.getUser);
router.post("/users/add", user.add);
router.get("/users/:uuid/inventory", user.getUserInventory);

export default router;
