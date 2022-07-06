import React from "react";
import { Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import { firebase } from "./global/auth";
import {
  setAuthenticatedUser,
  clearAuthenticatedUser,
} from "./global/state/authSlice";
import { setIsAuthenticationLoaded } from "./global/state/appSlice";
import { useAppDispatch } from "./global/state/store";
import "./styles/App.css";

function App() {
  const dispatch = useAppDispatch();

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

  return (
    <div className="App">
      <Layout>
        <Outlet />
      </Layout>
    </div>
  );
}

export default App;
