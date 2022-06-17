import express from "express";
import bodyParser from "body-parser";
import path from "path";
import * as dotenv from "dotenv";
import cors from "cors";
import routes from "./routes";

// To use the .env file, we use the dotenv module to load the values
// Have to give the dotenv config the relative path to .env for it to work properly
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const CORS_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://master--h3-test.netlify.app",
];

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: CORS_ALLOWED_ORIGINS,
    credentials: true,
    preflightContinue: true,
    allowedHeaders: ["Content-Type"],
  })
);
app.options("*", cors);

app.get("/", (req, res) => res.send("Backend is working!"));

app.use("/api", routes);

export default app;
