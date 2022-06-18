import app from "./server";
import config from "./config";

// start the server listening for requests
const port = config.port || 3001;

const start = async (p: number) => {
  app
    .listen(p, () => {
      console.log(`Server is running on port ${port}...`);
    })
    .on("error", (err) => {
      console.error(err);
      process.exit(1);
    });
};

start(port);
