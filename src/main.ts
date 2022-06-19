import { logger } from "./logger";
import app from "./server";
import config from "./config";
import { setupDB } from "./data/db";

// start the server listening for requests
const port = config.port || 3001;

const start = async (p: number) => {
  app
    .listen(p, () => {
      logger.info(`Server is running on port ${port}...`);
    })
    .on("error", (err) => {
      logger.error(err);
      process.exit(1);
    });
};

setupDB(config.node_env || "development");

start(port);
