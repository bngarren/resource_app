import { Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import "./styles/App.css";

function App() {
  return (
    <div className="App">
      <Layout>
        <Outlet />
      </Layout>
    </div>
  );
}

export default App;
