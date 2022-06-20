import pino from "pino";
import config from "../config";

export const logger = pino({
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  level: config.logger_level,
});
