import { Link } from "react-router-dom";
import useAuth from "../../global/auth/useAuth";

const PublicLanding = () => {
  const auth = useAuth();

  if (!auth.user) {
    return (
      <>
        Welcome to Resource App. You need to <Link to="/login">login</Link>
      </>
    );
  }

  return <>Welcome, {auth.user}!</>;
};

export default PublicLanding;
