"use client";

import * as React from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

import { styled } from "@mui/material/styles";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function DirectionStack() {
  return (
    <div className="stack_box">
      <Stack direction="row" style={{ height: "80%" }} spacing={2}>
        <Item className="room_id" style={{ alignItems: "center" }}>
          002
        </Item>
      </Stack>
    </div>
  );
}
