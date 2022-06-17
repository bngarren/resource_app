import express from "express";
import { playerAction } from "../controllers";

const router = express.Router();

router.post("/scan", playerAction.scan);

export default router;
