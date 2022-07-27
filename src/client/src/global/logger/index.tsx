import {
  alpha,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { amber, cyan, grey, red, yellow } from "@mui/material/colors";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import { LogType, reset } from "../state/loggerSlice";
import { useAppDispatch, useAppSelector } from "../state/store";
import { CSSProperties } from "@mui/styled-engine";

const Logger = () => {
  const dispatch = useAppDispatch();
  const logs = useAppSelector((state) => state.logger.data);

  const getStyle = (type: LogType) => {
    return {
      debug: {
        backgroundColor: grey[50],
        color: "black",
        chipColor: alpha(grey[100], 0.7),
        icon: () => <DoubleArrowIcon />,
        iconColor: grey[400],
      },
      info: {
        backgroundColor: cyan[50],
        color: "black",
        chipColor: alpha(cyan[100], 0.7),
        icon: () => <InfoIcon />,
        iconColor: cyan[400],
      },
      warn: {
        backgroundColor: amber[50],
        color: "black",
        chipColor: alpha(amber[100], 0.7),
        icon: () => <WarningIcon />,
        iconColor: amber[300],
      },
      error: {
        backgroundColor: red[100],
        color: "white",
        chipColor: alpha(red[200], 0.7),
        icon: () => <ErrorIcon />,
        iconColor: red[800],
      },
    }[type];
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Button onClick={() => dispatch(reset())}>Clear</Button>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>type/category</TableCell>
              <TableCell>message</TableCell>
              <TableCell>time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => {
              const style = getStyle(log.type);
              return (
                <TableRow
                  key={log.id}
                  sx={{
                    backgroundColor: style.backgroundColor,
                    color: style.color,
                    "& .MuiTableCell-root": { fontSize: "0.7rem" },
                  }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        icon={style.icon()}
                        label={log.category}
                        size="small"
                        sx={{
                          backgroundColor: style.chipColor,
                          "& .MuiChip-icon": {
                            color: style.iconColor,
                          },
                        }}
                      />
                    </Stack>
                  </TableCell>
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
