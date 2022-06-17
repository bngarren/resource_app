import app from "./server";

// start the server listening for requests
const port = parseInt(process.env.PORT as string, 10) || 3001;

const start = (p: number) => {
  try {
    app.listen(p, () => {
      console.log(`Server is running on port ${port}...`);
    });
  } catch (err) {
    console.error(err);
    process.exit();
  }
};

start(port);
