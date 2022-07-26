import * as React from "react";
import MapWrapper from "../../components/MapWrapper";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import GpsOffIcon from "@mui/icons-material/GpsOff";
import config from "../../config";
import { UserPosition } from "../../types";
import { h3ToGeo } from "h3-js";
import { useAppDispatch, useAppSelector } from "../../global/state/store";
import { geoCoordinatesToLatLngTuple } from "../../util";
import { useScan } from "../PlayerHome/GatherController/useScan";
import { startWatcher } from "../../global/state/geoLocationSlice";
import {
  Box,
  Button,
  Container,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import { useAddUserMutation } from "../../global/state/apiSlice";
import { useToasty } from "../../components/Toasty";
import Logger from "../../global/logger";

const StyledBox = styled(Box, {
  name: "Dashboard",
  slot: "section",
})(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
}));

const Dashboard = () => {
  const dispatch = useAppDispatch();

  // Get the initial GPS location to initialize the MapWrapper
  const initialLocation = useAppSelector((state) =>
    state.geoLocation.initialLocation
      ? geoCoordinatesToLatLngTuple(state.geoLocation.initialLocation.coords)
      : undefined
  );

  // This component will initialize a watcher session on mount if
  // one isn't already running
  const hasInitiatedWatcher = React.useRef(false);

  // The user scan operation
  const { scan, scannedLocation, scanStatus, scanResult } = useScan();

  // Add user
  const [addUser] = useAddUserMutation();

  // Toasty
  const { openToasty } = useToasty();

  const [positionInput, setPositionInput] = React.useState("");

  /*   React.useEffect(() => {
    if (!hasInitiatedWatcher.current) {
      dispatch(startWatcher);
      hasInitiatedWatcher.current = true;
    }
  }, [dispatch]); */

  const handleScan = async () => {
    if (positionInput) {
      const coords = h3ToGeo(positionInput) as [number, number];
      scan(coords);
    } else {
      scan();
    }
  };

  const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const uuid = formData.get("uuid") as string;

    const newUserJSON = {
      uuid,
    };

    try {
      const addUserPromise = await addUser({ body: newUserJSON }).unwrap();

      openToasty("New user successfully added to the database.", "success");
      console.log("FROM SERVER:", addUserPromise.message);
    } catch (error) {
      if (error instanceof Error) {
        //! Toasting the errors for debug purposes...
        openToasty(error.message, "error");
      }
      console.error(error);
    }
  };

  return (
    <>
      <div
        id="mapContainer"
        style={{ width: "100%", height: "400px", marginBottom: "1rem" }}
      >
        <MapWrapper
          initialLocation={initialLocation}
          userPosition={scannedLocation}
          scanStatus={scanStatus}
          resources={scanResult?.interactables.resources}
        />
      </div>
      <Container>
        <Stack direction="column" spacing={4}>
          <StyledBox>
            <Typography variant="h6">Scan from</Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                value={positionInput}
                onChange={(e) => setPositionInput(e.target.value)}
                label="h3 index"
              />
              <Button variant="contained" onClick={handleScan}>
                Scan
              </Button>
            </Stack>
          </StyledBox>
          <StyledBox>
            <Typography variant="h6">Add user</Typography>
            <Box
              component="form"
              onSubmit={handleAddUser}
              sx={{
                "& .MuiFormControl-root": {
                  margin: 0,
                },
              }}
            >
              <Stack direction="row" spacing={2}>
                <TextField
                  margin="normal"
                  required
                  id="uuid"
                  label="UUID"
                  name="uuid"
                />
                <Button type="submit" variant="contained">
                  Add User
                </Button>
              </Stack>
            </Box>
          </StyledBox>
          <StyledBox sx={{ width: "100%" }}>
            <Typography variant="h6">Log</Typography>
            <Logger />
          </StyledBox>
        </Stack>
      </Container>
    </>
  );
};

export default Dashboard;
