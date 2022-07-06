import { Box, Typography } from "@mui/material";
import { useAuth } from "../../../global/auth";
import { useGetUserInventoryQuery } from "../../../global/state/apiSlice";

const InventoryController = () => {
  const { user } = useAuth();
  const {
    data: userInventory,
    error,
    isLoading,
  } = useGetUserInventoryQuery(user?.uuid || "", {
    skip: !user,
  });

  return (
    <>
      <Typography variant="h3">Inventory</Typography>
      <Box>{userInventory && JSON.stringify(userInventory)}</Box>
    </>
  );
};

export default InventoryController;
