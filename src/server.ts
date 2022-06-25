import express, { Request } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes";
import config from "./config";
import { logRequest } from "./middleware/logRequest";
import firebaseAuthentication from "./middleware/firebaseAuthentication";

const CORS_OPTIONS = {
  origin: config.cors_allowed_origins,
  credentials: true,
  preflightContinue: true,
  allowedHeaders: ["Content-Type"],
};

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(CORS_OPTIONS));
app.options("*", cors<Request>());
app.use(logRequest);

app.get("/", (req, res) => res.send(`Backend is working!`));

// Firebase authentication middleware
app.use(firebaseAuthentication);

app.use("/api", routes);

export default app;
