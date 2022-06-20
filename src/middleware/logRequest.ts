import expressPino, { Options } from "express-pino-logger";
import { ServerResponse } from "http";
import pino from "pino";
import { logger } from "../logger";

// Custom middleware to pino log incoming requests

const options: Options = {
  logger: logger,

  // Define a custom logger level
  customLogLevel: function (res: ServerResponse, err: Error) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return "warn";
    } else if (res.statusCode >= 500 || err) {
      return "error";
    }
    return "debug" as pino.Level;
  },

  // Define a custom success message
  customSuccessMessage: function (res: ServerResponse) {
    if (res.statusCode === 404) {
      return "Resource not found";
    }
    return `Request completed`;
  },

  // Define a custom error message
  customErrorMessage: function (err: Error, res: ServerResponse) {
    return "Request errored with status code: " + res.statusCode;
  },

  // Override attribute keys for the log object
  customAttributeKeys: {
    req: "request",
    res: "response",
    err: "error",
    responseTime: "timeTaken",
  },
};

export const logRequest = expressPino(options);
