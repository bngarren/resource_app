import { IconButton, Snackbar } from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import * as React from "react";

type SeverityType = "success" | "error" | "warning" | "info";

interface ToastyContextType {
  openToasty: (message: string, type: SeverityType) => void;
  closeToasty: (event?: React.SyntheticEvent | Event, reason?: string) => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const ToastyContext = React.createContext<ToastyContextType>(null!);

const ToastyProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [type, setType] = React.useState<SeverityType>("info");

  const handleOpen = (message: string, type: SeverityType = "info") => {
    setMessage(message);
    setType(type);
    setOpen(true);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const contextValue: ToastyContextType = {
    openToasty: handleOpen,
    closeToasty: handleClose,
  };

  const action = (
    <IconButton
      size="small"
      aria-label="close"
      color={type}
      onClick={handleClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <ToastyContext.Provider value={contextValue}>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={4000}
        onClose={handleClose}
        open={open}
        action={action}
      >
        <Alert onClose={handleClose} severity={type}>
          {message}
        </Alert>
      </Snackbar>
      {children}
    </ToastyContext.Provider>
  );
};

export default ToastyProvider;

export const useToasty = () => {
  return React.useContext(ToastyContext);
};
