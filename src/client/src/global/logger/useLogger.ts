import { useMemo, useCallback } from "react";
import { LogType, log, LogCategory } from "./../state/loggerSlice";
import { useAppDispatch } from "./../state/store";

type UseLoggerOptions = {
  prepend?: string;
};

/**
 * ### useLogger
 * ---
 * Custom hook for logging to redux store (loggerSlice)
 *
 * @param options
 * ```javascript
 *  {
 *    prepend: "ComponentName"
 *  }
 * ```
 * @returns `logger` function
 */
export const useLogger = (options: UseLoggerOptions = {}) => {
  const dispatch = useAppDispatch();

  const logger = useCallback(
    (
      message: string,
      category: LogCategory = "app",
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
    [dispatch, options.prepend]
  );

  return useMemo(() => ({ logger }), [logger]);
};
