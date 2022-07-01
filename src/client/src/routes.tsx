import {
  Routes as RouterRoutes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import App from "./App";
import AppDebug from "./AppDebug";
import Dashboard from "./domains/Dashboard";
import LoginOrSignup from "./domains/LoginOrSignup";
import PlayerHome from "./domains/PlayerHome";
import PublicLanding from "./domains/PublicLanding";
import { useAuth } from "./global/auth";

const Routes = () => {
  return (
    <RouterRoutes>
      <Route element={<App />}>
        <Route path="/" element={<PublicLanding />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <PlayerHome />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <LoginOrSignup type="login" />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuth>
              <LoginOrSignup type="signup" />
            </RedirectIfAuth>
          }
        />
        <Route path="/debug" element={<AppDebug />} />
        <Route
          path="*"
          element={
            <main style={{ padding: "1rem" }}>
              <p>There&apos;s nothing here!</p>
            </main>
          }
        />
      </Route>
    </RouterRoutes>
  );
};

function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    console.log(`Can't access ${location.pathname}, redirecting to /login`);
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

/** If a user is already signed in, they should be redirected when trying to access
 * this route
 */
function RedirectIfAuth({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.user) {
    return <Navigate to="/home" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export default Routes;
