import { Box, List, ListItem, Typography } from "@mui/material";
import { useAuth } from "../../../global/auth";
import { useGetUserInventoryQuery } from "../../../global/state/apiSlice";
import { useAppSelector } from "../../../global/state/store";

const InventoryController = () => {
  const user = useAppSelector((state) => state.auth.user);
  const {
    data: userInventory,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useGetUserInventoryQuery(
    {
      // We skip the fetch until a user is true; need this non-null assertion or it doesn't type well
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      uuid: user!.uuid,
    },
    { skip: !user }
  );

  if (isError) {
    console.error(error);
  }

  return (
    <>
      <Typography variant="h3">Inventory</Typography>
      <Box>
        {isError && <>There was an error loading your inventory.</>}
        {isLoading && <>Loading your inventory...</>}
        {isSuccess && (
          <>
            <List>
              {userInventory.items?.allIds?.map((iid) => {
                const item = userInventory.items.byId[iid];
                return <ListItem key={item.id}>{item.name}</ListItem>;
              })}
            </List>
          </>
        )}
      </Box>
    </>
  );
};

export default InventoryController;
