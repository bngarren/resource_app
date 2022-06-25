import { Container, Typography } from "@mui/material";
import { Link, Outlet } from "react-router-dom";
import useAuth from "../../global/auth/useAuth";

const PublicLanding = () => {
  const auth = useAuth();

  return (
    <>
      <Container maxWidth="md">
        <Typography variant="h3">Welcome to Resource App.</Typography>

        {!auth.user && (
          <Typography variant="body1">
            You need to <Link to="/login">login.</Link>
          </Typography>
        )}
      </Container>
    </>
  );
};

export default PublicLanding;
