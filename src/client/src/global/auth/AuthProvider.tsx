import React from "react";

interface AuthContextType {
  user: any;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<any>(null);

  const value = { user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
