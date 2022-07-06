import { useGetUserInventoryQuery } from "../../global/state/apiSlice";
import ScanController from "./ScanController";
import { useAuth } from "../../global/auth";

const PlayerHome = () => {
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
      <ScanController />
      {error ? (
        <>Oh no, there was an error getting your inventory.</>
      ) : isLoading ? (
        <>Updating inventory...</>
      ) : userInventory ? (
        <>
          <pre>{JSON.stringify(userInventory, null, 2)}</pre>
        </>
      ) : null}
    </>
  );
};

export default PlayerHome;
