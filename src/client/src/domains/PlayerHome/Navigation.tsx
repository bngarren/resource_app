import * as React from "react";
import { BottomNavigation, BottomNavigationAction, Link } from "@mui/material";
import BlurCircularIcon from "@mui/icons-material/BlurCircular";
import AppsIcon from "@mui/icons-material/Apps";
import ConstructionIcon from "@mui/icons-material/Construction";
import { PlayerHomeView } from ".";
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";

const GatherLink = React.forwardRef<any, Omit<RouterLinkProps, "to">>(
  (props, ref) => <RouterLink ref={ref} to="/home/gather" {...props} />
);
GatherLink.displayName = "GatherLink";

const InventoryLink = React.forwardRef<any, Omit<RouterLinkProps, "to">>(
  (props, ref) => <RouterLink ref={ref} to="/home/inventory" {...props} />
);
InventoryLink.displayName = "InventoryLink";

const CraftLink = React.forwardRef<any, Omit<RouterLinkProps, "to">>(
  (props, ref) => <RouterLink ref={ref} to="/home/craft" {...props} />
);
CraftLink.displayName = "CraftLink";

type NavigationProps = {
  currentView: PlayerHomeView;
  onChange: (nextView: PlayerHomeView) => void;
};

const Navigation = ({ currentView, onChange }: NavigationProps) => {
  return (
    <BottomNavigation
      showLabels
      value={currentView}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
    >
      <BottomNavigationAction
        label="Gather"
        value="GATHER"
        icon={<BlurCircularIcon />}
        component={GatherLink}
      />

      <BottomNavigationAction
        label="Inventory"
        value="INVENTORY"
        icon={<AppsIcon />}
        component={InventoryLink}
      />
      <BottomNavigationAction
        label="Craft"
        value="CRAFT"
        icon={<ConstructionIcon />}
        component={CraftLink}
      />
    </BottomNavigation>
  );
};

export default Navigation;
