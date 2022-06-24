import * as React from "react";
import { AuthContext } from "./AuthProvider";

const useAuth = () => {
  const context = React.useContext(AuthContext);
  return context;
};

export default useAuth;
