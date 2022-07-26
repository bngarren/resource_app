import { useMemo, useCallback } from "react";
import { LogType, log } from "./../state/loggerSlice";
import { useAppDispatch } from "./../state/store";
export const useLogger = () => {
  const dispatch = useAppDispatch();

  const logger = useCallback(
    (message: string, type: LogType = "debug", skipConsole = false) => {
      dispatch(log({ message, type, skipConsole }));
    },
    [dispatch]
  );

  return useMemo(() => ({ logger }), [logger]);
};
