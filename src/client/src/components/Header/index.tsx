import { CSSProperties } from "react";
import { NavLink } from "react-router-dom";

const inactiveLinkStyle = {
  color: "blue",
} as CSSProperties;

const activelinkStyle = {
  textDecoration: "underline",
} as CSSProperties;

const Header = () => {
  return (
    <header>
      <nav>
        <NavLink
          to="/app"
          style={({ isActive }) =>
            isActive ? activelinkStyle : inactiveLinkStyle
          }
        >
          App
        </NavLink>
        <NavLink
          to="/dashboard"
          style={({ isActive }) =>
            isActive ? activelinkStyle : inactiveLinkStyle
          }
        >
          Dashboard
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;
