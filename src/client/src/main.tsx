//import "./global/wdyr";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Routes from "./routes";
import { AuthProvider } from "./global/auth";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/Theme";

// Fonts (installed via npm)
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import ToastyProvider from "./components/Toasty";

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline>
      <AuthProvider>
        <ToastyProvider>
          <BrowserRouter>
            <Routes />
          </BrowserRouter>
        </ToastyProvider>
      </AuthProvider>
    </CssBaseline>
  </ThemeProvider>
);
