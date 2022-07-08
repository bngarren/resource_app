import { useNavigate, useLocation, Link } from "react-router-dom";
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
import { signIn, createUser } from "../../global/auth/firebase";

type LoginOrSignupProps = {
  type: "login" | "signup";
};

const LoginOrSignup = (props: LoginOrSignupProps) => {
  const { type } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  const from = locationState?.from || "/home";

  const { openToasty } = useToasty();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let didError = false;

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    let fb_result: UserCredential | Error;
    if (type === "login") {
      fb_result = await signIn(email, password);
    } else if (type === "signup") {
      fb_result = await createUser(email, password);
    } else {
      fb_result = new Error("Could not complete. Try reloading the page.");
    }

    if (fb_result instanceof Error) {
      openToasty(fb_result.message, "error");
      didError = true;
    }

    // Handle our database side of the sign up process
    if (type === "signup" && !(fb_result instanceof Error)) {
      // Make a new user object
      const newUserJSON = {
        uuid: fb_result.user.uid,
      };

      try {
        //! TODO
        // Success...
        openToasty(
          "You are in! Get out there and find some resources!",
          "success"
        );
      } catch (error) {
        if (error instanceof Error) {
          //! Toasting the errors for debug purposes...
          openToasty(error.message, "error");
        }
        console.log(error);
        didError = true;
        // Rollback the new firebase user
        // TODO new to try/catch here
        await fb_result.user.delete();
      }
    }

    //console.log("userCredential", fb_result);

    // If no errors, navigate to where they were trying to go
    if (!didError) {
      navigate(from, { replace: true });
    }
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
