import { logger } from "./logger";
import app from "./server";
import config from "./config";
import { setupDB } from "./data/db";

// start the server listening for requests
const port = config.port || 3001;

const message = `



--------------------------------------------------------------------------------------
     ____  ___________ ____  __  ______  ____________            ___    ____  ____ 
    / __ \\/ ____/ ___// __ \\/ / / / __ \\/ ____/ ____/           /   |  / __ \\/ __ \\
   / /_/ / __/  \\__ \\/ / / / / / / /_/ / /   / __/    ______   / /| | / /_/ / /_/ /
  / _, _/ /___ ___/ / /_/ / /_/ / _, _/ /___/ /___   /_____/  / ___ |/ ____/ ____/ 
 /_/ |_/_____//____/\\____/\\____/_/ |_|\\____/_____/           /_/  |_/_/   /_/ 

    Server v${process.env.npm_package_version} 
--------------------------------------------------------------------------------------

    Running on port: ${port}
    Log level: "${logger.level}" [${Object.keys(logger.levels.values)}]
    NODE_ENV: "${config.node_env}"
`;

const start = async (p: number) => {
  app
    .listen(p, () => {
      logger.info(message);

      // Display the current log level (and available levels)
      logger.info(
        "Log level = %s => %o",
        logger.level,
        Object.keys(logger.levels.values)
      );
    })
    .on("error", (err) => {
      logger.error(err);
      process.exit(1);
    });
};

setupDB(config.node_env || "development");

start(port);
