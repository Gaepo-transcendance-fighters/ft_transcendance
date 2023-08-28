import { Box } from "@mui/material";
import React, { useRef } from "react";

const GamePaddle = ({ x, y }: { x: number; y: number }) => {
  return (
    <Box
      component={"div"}
      sx={{
        position: "absolute",
        width: "20px",
        height: "100px",
        backgroundColor: "grey",
        transform: `translate(${x}px, ${y}px)`,
        transition: "transform 150ms linear",
      }}
    ></Box>
  );
};

export default GamePaddle;
