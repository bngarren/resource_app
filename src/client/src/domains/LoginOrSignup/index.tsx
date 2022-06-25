import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../global/auth";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useToasty } from "../../components/Toasty";
import { UserCredential } from "firebase/auth";
import { LocationState } from "../../types";

type LoginOrSignupProps = {
  type: "login" | "signup";
};

const LoginOrSignup = (props: LoginOrSignupProps) => {
  const { type } = props;
  const { createUser, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  const from = locationState?.from || "/app";

  console.log("In /login, came from", from);

  const { openToasty } = useToasty();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    let result: UserCredential | Error;
    if (type === "login") {
      result = await signIn(email, password);
    } else if (type === "signup") {
      result = await createUser(email, password);
    } else {
      result = new Error("Could not complete. Try reloading the page.");
    }

    if (result instanceof Error) {
      openToasty(result.message, "error");
      return;
    }
    console.log("userCredential", result);

    navigate(from, { replace: true });
  };

  const getTitle = () => {
    return type === "login" ? "Sign in" : "Sign up";
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {getTitle()}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          {type === "login" && (
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {getTitle()}
          </Button>
          {type === "login" && (
            <Grid container>
              <Grid item xs>
                <Link to="#">Forgot password?</Link>
              </Grid>
              <Grid item>
                <Link to="/signup">{"Don't have an account? Sign Up"}</Link>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default LoginOrSignup;
