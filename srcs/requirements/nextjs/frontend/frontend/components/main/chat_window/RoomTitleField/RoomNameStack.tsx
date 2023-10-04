"use client";

import * as React from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

import { styled } from "@mui/material/styles";
import { useRoom } from "@/context/RoomContext";
import { Typography } from "@mui/material";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: "yellow",
}));

export default function DirectionStack() {
  const { roomState } = useRoom();

  const functionChIdx = () => {
    let idx = roomState.currentRoom?.channelIdx;
    var displayIdx: string = "";
    if (idx && idx >= 0 && idx <= 9) {
      displayIdx = "00" + idx;
    } else if (idx && idx > 9 && idx <= 99) {
      displayIdx = "0" + idx;
    } else if (idx && idx > 99 && idx <= 999) {
      displayIdx = idx.toString();
    }
    return <Typography>{displayIdx}</Typography>
  };
  return (
    <div className="stack_box">
      <Stack direction="row" style={{ height: "80%" }} spacing={2}>
        <Item className="room_id" style={{ alignItems: "center" }}>
          {functionChIdx()}
        </Item>
      </Stack>
    </div>
  );
}
