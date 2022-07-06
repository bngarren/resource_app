import React from "react";
import { Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import { firebase } from "./global/auth";
import {
  setAuthenticatedUser,
  clearAuthenticatedUser,
} from "./global/state/authSlice";
import { useAppDispatch } from "./global/state/store";
import "./styles/App.css";

function App() {
  const dispatch = useAppDispatch();

  // Subscribe to firebase's auth changes so that we can keep our redux state updated
  React.useEffect(() => {
    const unsubscribe = firebase.onAuthChange(async (user) => {
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
    });
    return () => {
      unsubscribe();
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
