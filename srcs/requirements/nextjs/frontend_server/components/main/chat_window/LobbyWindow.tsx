"use client";

import { main } from "@/font/color";
import { Box, Typography } from "@mui/material";
import Image from "next/image";

const LobbyWindow = () => {
  return (
    <Box
      sx={{
        margin: "0",
        padding: "0",
        height: "58vh",
        minWidth: "300px",
        backgroundColor: main.background,
        backgroundBlendMode: "multiply",
        borderRadius: "10px",
        textAlign: "center",
      }}
    >
      <Image
        src="/gif/waterBallon.gif"
        alt="lobby waiting"
        width={300}
        height={300}
      />
      <Typography fontSize={"large"}>채팅 방을 선택해주세요.</Typography>
    </Box>
  );
};

export default LobbyWindow;
