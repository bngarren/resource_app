import * as dotenv from "dotenv";
import path from "path";

// To use the .env file, we use the dotenv module to load the values
// Have to give the dotenv config the relative path to .env for it to work properly
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

export default {
  cors_allowed_origins: [
    "http://localhost:3000",
    "https://resource-app-client.netlify.app",
  ],
  port: parseInt(process.env.PORT as string, 10),
  node_env: process.env.NODE_ENV,
  db_user: process.env.DB_USER,
  db_host: process.env.DB_HOST,
  db_port: parseInt(process.env.DB_PORT as string, 10),
  db_name: process.env.DB_NAME,
  db_test_name: process.env.DB_TEST_NAME,
};
