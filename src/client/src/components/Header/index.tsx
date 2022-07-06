import * as React from "react";
import {
  AppBar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import HexagonIcon from "@mui/icons-material/Hexagon";
import AdbIcon from "@mui/icons-material/Adb";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../global/auth";
import { signOut } from "../../global/auth/firebase";

const Header = () => {
  const { user } = useAuth();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  return (
    <header>
      <AppBar position="static" sx={{ backgroundColor: "#1D093D" }}>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            RESOURCE APP
          </Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <IconButton component={Link} to="/home" size="large">
              <HexagonIcon sx={{ color: "#D7F363" }} />
            </IconButton>

            <Typography variant="overline">{user?.email}</Typography>
          </Stack>
          <Box sx={{ position: "absolute", right: "1rem" }}>
            <Tooltip title="Open settings">
              <IconButton
                onClick={handleOpenNavMenu}
                sx={{ p: 0 }}
                size="large"
              >
                <AccountCircleIcon sx={{ color: "#eee" }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{
              display: "block",
              "& .MuiMenuItem-root": {
                padding: 1,
                "& .MuiSvgIcon-root": {
                  marginRight: 1,
                },
              },
            }}
          >
            <MenuItem>
              <IconButton
                component={Link}
                to="/dashboard"
                onClick={handleCloseNavMenu}
              >
                <AdbIcon sx={{ color: "#888" }} />
                <Typography variant="button">Dashboard</Typography>
              </IconButton>
            </MenuItem>
            <Divider />
            <MenuItem>
              <IconButton
                onClick={async () => {
                  handleCloseNavMenu();
                  await signOut();
                }}
              >
                <LogoutIcon />
                <Typography variant="button">Logout</Typography>
              </IconButton>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </header>
  );
};

export default Header;
