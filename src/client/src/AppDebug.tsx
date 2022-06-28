import * as React from "react";
import { useGeoLocation } from "./global/useGeoLocation.new";

const AppDebug = () => {
  const { startWatcher, getCurrentPositionPromise } = useGeoLocation();

  React.useEffect(() => {
    startWatcher();
  }, []);

  return <>Test</>;
};
export default AppDebug;
