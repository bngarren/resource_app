// Config that tells the client which API to hit based on the environment

const production = {
  url: "https://resource-app-backend.herokuapp.com/api",
};
const development = {
  url: "http://localhost:5000/api",
};
export default process.env.NODE_ENV === "development"
  ? development
  : production;
