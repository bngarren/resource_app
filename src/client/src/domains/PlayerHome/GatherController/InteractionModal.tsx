import { Box, IconButton, Modal, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { grey } from "@mui/material/colors";
import * as React from "react";
import { AnyInteractable, APITypes } from "../../../types";
import { latLngTupleToString } from "../../../util";

type InteractionModalProps = {
  open: boolean;
  handleClose: (reason?: "backdropClick" | "escapeKeyDown") => void;
  interactable: AnyInteractable | null;
};

export const InteractionModal = ({
  open,
  handleClose,
  interactable,
}: InteractionModalProps) => {
  return (
    <Modal open={open} onClose={(_, r) => handleClose(r)}>
      <Box
        sx={{
          position: "absolute",
          top: "6vh",
          left: "2vw",
          width: "96vw",
          height: "80vh",
          background: "white",
          borderRadius: "8px",
        }}
      >
        {interactable && (
          <>
            <Box
              sx={{
                width: "100%",
                height: "auto",
                backgroundColor: "purple",
                color: "white",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                padding: 1,
              }}
            >
              <Typography variant="h6">{interactable.name}</Typography>
              <IconButton
                sx={{ position: "absolute", top: 0, right: 1 }}
                onClick={() => handleClose()}
              >
                <CloseIcon sx={{ color: grey[400] }} />
              </IconButton>
            </Box>
            <Box sx={{ padding: 1 }}>
              <Typography variant="body1">
                {latLngTupleToString(interactable.position)}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};
