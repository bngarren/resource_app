import express from "express";
import { debug, playerAction } from "../controllers";

const router = express.Router();

router.post("/scan", playerAction.scan);
router.get("/debug", debug.showRecent);

export default router;
