import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import { firebase } from "./global/auth";
import {
  setAuthenticatedUser,
  clearAuthenticatedUser,
} from "./global/state/authSlice";
import { setIsAuthenticationLoaded } from "./global/state/appSlice";
import { useAppDispatch } from "./global/state/store";
import "./styles/App.css";
import { useLogger } from "./global/logger/useLogger";

function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { logger } = useLogger();

  // Subscribe to firebase's auth changes so that we can keep our redux state updated
  React.useEffect(() => {
    const unsubscribe1 = firebase.onAuthChange(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        dispatch(
          setAuthenticatedUser({
            user: { uuid: user.uid, email: user.email },
            token: token,
          })
        );
      } else {
        dispatch(clearAuthenticatedUser);
      }
      dispatch(setIsAuthenticationLoaded(true));
    });
    const unsubscribe2 = firebase.onTokenChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        dispatch(
          setAuthenticatedUser({
            user: { uuid: user.uid, email: user.email },
            token: token,
          })
        );
      } else {
        dispatch(clearAuthenticatedUser);
      }
      dispatch(setIsAuthenticationLoaded(true));
    });
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [dispatch]);

  // Logging Router location changes
  React.useEffect(() => {
    logger(`location changed to ${location.pathname}`, "router", "info");
  }, [location, logger]);

  return (
    <div className="App">
      <Layout>
        <Outlet />
      </Layout>
    </div>
  );
}

export default App;
