import { Routes as RouterRoutes, Route } from "react-router-dom";
import App from "./App";
import Layout from "./components/Layout";
import Dashboard from "./domains/Dashboard";

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Layout />}>
        <Route path="/app" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route
        path="*"
        element={
          <main style={{ padding: "1rem" }}>
            <p>There&apos;s nothing here!</p>
          </main>
        }
      />
    </RouterRoutes>
  );
};

export default Routes;
