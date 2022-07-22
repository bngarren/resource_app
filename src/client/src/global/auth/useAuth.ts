import { useAppSelector } from "../state/store";

/**
 * Helper hook that selects the auth state from our store
 * @returns The auth state from our store
 */
const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);

  return auth;
};
export default useAuth;
