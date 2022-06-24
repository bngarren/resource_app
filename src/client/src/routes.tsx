import {
  Routes as RouterRoutes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import App from "./App";
import Layout from "./components/Layout";
import Dashboard from "./domains/Dashboard";
import LoginPage from "./domains/Login";
import PublicLanding from "./domains/PublicLanding";
import { useAuth } from "./global/auth";

const Routes = () => {
  return (
    <RouterRoutes>
      <Route element={<Layout />}>
        <Route path="/" element={<PublicLanding />}>
          <Route
            path="/app"
            element={
              <RequireAuth>
                <App />
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
        </Route>
        <Route path="/login" element={<LoginPage />} />
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default Routes;
