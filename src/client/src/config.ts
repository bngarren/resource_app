// Config that tells the client which API to hit based on the environment

const production = {
  url: "https://resource-app-backend.herokuapp.com/api",
};
const development = {
  url: "http://localhost:5000/api",
};

export default {
  /**
   * Which API endpoint to use, based on process.env.NODE_ENV
   */
  api_url:
    process.env.NODE_ENV === "development" ? development.url : production.url,
  /**
   * How long the watchPosition session will run before ending itself
   */
  geoLocation_watcher_duration: 10000, // 2 minutes
  /**
   * How long useGeoLocation will wait to improve accuracy before releasing its most recent location
   */
  geoLocation_watcher_maxWait: 6000, // 6 seconds
  /**
   * The max amount of time useGeoLocation will wait for another watchResult to come through before deciding to release its most recent location
   */
  geoLocation_watcher_maxTimeSinceLastWatchResult: 1500, // 1.5 seconds

  /**
   * The max amount of time the watcher has to return a position before a timeout error is thrown.
   * Don't necessarily have to do anything with error; maybe debug or report to the client
   */
  geoLocation_watcher_timeout: 10000,

  /**
   * Minimum time for a scan animation
   * Actual scan could take longer, depending on network
   */
  scanAnimationTime: 1500, // 1.5 seconds

  /**
   * Whether to run app in debug mode, which provides additional UI and custom controls
   */
  debugMode: true,
};
