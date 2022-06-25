import { Typography } from "@mui/material";
import { Link, Outlet } from "react-router-dom";
import useAuth from "../../global/auth/useAuth";

const PublicLanding = () => {
  const auth = useAuth();

  if (!auth.user) {
    return (
      <>
        Welcome to Resource App. You need to <Link to="/login">login</Link>
      </>
    );
  } else {
    return <Outlet />;
  }

  return <></>;
};

export default PublicLanding;
