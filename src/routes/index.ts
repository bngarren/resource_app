import express from "express";
import { debug, playerAction, user } from "../controllers";

const router = express.Router();

router.post("/scan", playerAction.scan);
router.post("/user/add", user.add);
router.get("/debug", debug.showRecent);

export default router;
