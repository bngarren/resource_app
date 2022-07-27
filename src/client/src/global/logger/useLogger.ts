import { useMemo, useCallback } from "react";
import { LogType, log, LogCategory } from "./../state/loggerSlice";
import { useAppDispatch } from "./../state/store";

type UseLoggerOptions = {
  prepend?: string;
  category?: LogCategory;
};

/**
 * ### useLogger
 * ---
 * Custom hook for logging to redux store (loggerSlice)
 *
 * @example
 * ```javascript
 *  const { logger } = useLogger(options)
 * // ...
 *  logger("This is a log", "domain", "warn", true)
 * ```
 * ---
 * @param options
 * ```javascript
 *  {
 *    prepend: "ComponentName" // add this before every message
 *    category: "redux" // category defalut
 *  }
 * ```
 * @returns `logger` function
 */
export const useLogger = (options: UseLoggerOptions = {}) => {
  const dispatch = useAppDispatch();

  const logger = useCallback(
    (
      message: string,
      category: LogCategory = options.category || "app",
      type: LogType = "debug",
      toConsole?: boolean
    ) => {
      let modifiedMessage = message;
      if (options.prepend) {
        modifiedMessage = `${options.prepend} - ${message}`;
      }

      dispatch(
        log({
          message: modifiedMessage,
          category,
          type,
          toConsole,
        })
      );
    },
    [dispatch, options.prepend, options.category]
  );

  return useMemo(() => ({ logger }), [logger]);
};
