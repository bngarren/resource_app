import React from "react";
import { firebase } from "./index";
import { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  createUser: typeof firebase.createUser;
  signIn: typeof firebase.signIn;
  signOut: typeof firebase.signOut;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const AuthContext = React.createContext<AuthContextType>(null!);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const unsubscribe = firebase.onAuthChange((user) => {
      if (user) {
        setUser(user);
        // ...
      } else {
        setUser(null);
      }
    });
    return () => {
      unsubscribe();
    };
  });

  const contextValue = {
    user,
    createUser: firebase.createUser,
    signIn: firebase.signIn,
    signOut: firebase.signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
