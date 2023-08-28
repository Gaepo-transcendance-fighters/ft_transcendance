"use client";

import { Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const SendButton = () => {
  return (
    <Button
      style={{
        width: "8.5vw",
        justifyContent: "center",
        alignItems: "center",
        verticalAlign: "middle",
        margin: "2.5% 0 2.5% 0",
      }}
      variant="contained"
    >
      Send
    </Button>
  );
};

export default SendButton;
