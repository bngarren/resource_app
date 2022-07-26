import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { amber, cyan, grey, red, yellow } from "@mui/material/colors";
import { LogType, reset } from "../state/loggerSlice";
import { useAppDispatch, useAppSelector } from "../state/store";

const Logger = () => {
  const dispatch = useAppDispatch();
  const logs = useAppSelector((state) => state.logger.data);

  const getColor = (type: LogType) => {
    const colorMap = {
      debug: grey[50],
      info: cyan[50],
      warn: amber[100],
      error: red[300],
    };
    if (type in colorMap) return colorMap[type];
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Button onClick={() => dispatch(reset())}>Clear</Button>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>type</TableCell>
              <TableCell>message</TableCell>
              <TableCell>time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => {
              return (
                <TableRow
                  key={log.id}
                  sx={{
                    backgroundColor: getColor(log.type),
                    "& .MuiTableCell-root": { fontSize: "0.7rem" },
                  }}
                >
                  <TableCell>{log.type}</TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell>
                    {new Date(log.time).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Logger;
