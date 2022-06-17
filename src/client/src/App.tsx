import * as React from "react";
import config from "./config";
import "./styles/App.css";

function App() {
  const [result, setResult] = React.useState();
  const [status, setStatus] = React.useState<string | null>(null);

  const scan = async () => {
    setStatus("Loading...");
    const res = await fetch(`${config.url}/scan`, {
      method: "POST",
    });
    if (!res.ok) {
      setStatus("Error");
    }
    const json = await res.json();
    setResult(json);
    setStatus(null);
  };

  return (
    <div className="App">
      <h1>Resource App</h1>
      <button onClick={scan}>Scan</button>
      <p>{status && status}</p>
      <pre>
        <code>{result && JSON.stringify(result, null, 2)}</code>
      </pre>
    </div>
  );
}

export default App;
