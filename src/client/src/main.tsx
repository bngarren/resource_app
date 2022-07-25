//import "./global/wdyr";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Routes from "./routes";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/Theme";

import ToastyProvider from "./components/Toasty";

// Redux
import { Provider } from "react-redux";
import { setupStore } from "./global/state/store";

// Fonts (installed via npm)
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const store = setupStore();
const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <ToastyProvider>
          <BrowserRouter>
            <Routes />
          </BrowserRouter>
        </ToastyProvider>
      </CssBaseline>
    </ThemeProvider>
  </Provider>
);
