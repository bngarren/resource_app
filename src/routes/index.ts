import express from "express";
import { scan } from "../controllers";

const router = express.Router();

router.post("/scan", scan);

export default router;
