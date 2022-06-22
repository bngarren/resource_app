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
    Log level: "${logger.level.toUpperCase()}" [${Object.keys(
  logger.levels.values
)}]
    NODE_ENV: "${config.node_env}"



`;

const start = async (p: number) => {
  const startTime = new Date();

  let uptimer: NodeJS.Timer;

  if (config.node_env === "development") {
    uptimer = setInterval(() => {
      const now = new Date();
      logger.info(`UPTIME: ${now.getMinutes() - startTime.getMinutes()}`);
    }, 900000); // every 15 min
  }

  app
    .listen(p, () => {
      logger.info(message);
      logger.info(
        `Server start: ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}`
      );
    })
    .on("error", (err) => {
      logger.error(err);
      if (uptimer) clearInterval(uptimer);
      process.exit(1);
    });
};

setupDB(config.node_env || "development");

start(port);
