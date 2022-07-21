import {
  Avatar,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { APITypes } from "../../../types";
import DiamondIcon from "@mui/icons-material/Diamond";
import React from "react";

type InteractablesDisplayProps = {
  interactables: Partial<APITypes.ScanResult["interactables"]>;
  onSelect(category: APITypes.Interactable["category"], id: number): void;
};

/**
 * ### InteractablesDisplay
 * Displays the Interactables currently available to the user/player.
 * These include resources, equipment, etc. that is within range of interaction
 */
const InteractablesDisplay = ({
  interactables,
  onSelect,
}: InteractablesDisplayProps) => {
  const handleClickInteractable = (
    event: React.MouseEvent<HTMLDivElement>,
    category: APITypes.Interactable["category"],
    id: number
  ) => {
    event.preventDefault();
    onSelect(category, id);
  };

  if (!interactables || !Object.keys(interactables).length) {
    return null;
  }
  return (
    <List>
      {interactables &&
        Object.keys(interactables).map((category) => {
          const catInteractables =
            interactables[
              category as keyof APITypes.ScanResult["interactables"]
            ];

          return (
            catInteractables &&
            catInteractables.map((interactable) => {
              return (
                <ListItemButton
                  key={`${category}-${interactable.id}`}
                  onClick={(e) =>
                    handleClickInteractable(
                      e,
                      interactable.category,
                      interactable.id
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <DiamondIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${interactable.name}`}
                    secondary={`${interactable.distanceFromUser}m`}
                  />
                </ListItemButton>
              );
            })
          );
        })}
    </List>
  );
};

export default InteractablesDisplay;
