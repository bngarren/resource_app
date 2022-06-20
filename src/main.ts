import { logger } from "./logger";
import app from "./server";
import config from "./config";
import { setupDB } from "./data/db";

const message = `
----------------------------------------------------------------------------

      ____  ___________ ____  __  ______  ____________       
     / __ \\/ ____/ ___// __ \\/ / / / __ \\/ ____/ ____/       
    / /_/ / __/  \\__ \\/ / / / / / / /_/ / /   / __/    ______
   / _, _/ /___ ___/ / /_/ / /_/ / _, _/ /___/ /___   /_____/
  /_/ |_/_____//____/\\____/\\____/_/ |_|\\____/_____/          
                                                        
    ___    ____  ____ 
   /   |  / __ \\/ __ \\
  / /| | / /_/ / /_/ /
 / ___ |/ ____/ ____/ 
/_/  |_/_/   /_/      

----------------------------------------------------------------------------

              `;

// start the server listening for requests
const port = config.port || 3001;

const start = async (p: number) => {
  app
    .listen(p, () => {
      console.log(message);
      logger.info(`Server is running on port ${port}...`);

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
