"use client";

import "@/components/main/room_list/RoomList.css";
import { Box, Button, Card, Stack, TextField, Typography } from "@mui/material";
import React, { useState } from "react";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "400px",
  bgcolor: "#67dcfb",
  borderRadius: "10px",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function EditRoomModal({ prop }: { prop: () => void }) {
  const [value, setValue] = useState("origin password");

  const handleClose = () => {
    prop();
  };

  return (
    <>
      <Box sx={style}>
        <Card sx={{ margin: 1, backgroundColor: "#50aef8" }}>
          <Box margin={1}>
            <Typography>방 정보 변경하기</Typography>
          </Box>
          <Card sx={{ margin: 1, backgroundColor: "#3b85d8" }}>
            <Stack margin={1}>
              <Typography>방 제목: </Typography>
            </Stack>
            <Stack margin={1}>
              <Typography>비밀번호 :</Typography>
              <TextField
                sx={{ backgroundColor: "#ffffff" }}
                value={value}
                // type="password"
                autoComplete="false"
                onChange={(e) => setValue(e.currentTarget.value)}
              />
            </Stack>
          </Card>
          <Stack margin={1}>
            <Typography fontSize={"small"}>**주의사항</Typography>
            <Typography fontSize={"small"}>
              비밀번호를 새로 등록할 수 있습니다.
            </Typography>
            <Typography fontSize={"small"}>
              비밀번호를 등록하지 않으면 공개방이 됩니다.
            </Typography>
            <Button
              variant="contained"
              sx={{ margin: "auto" }}
              onClick={handleClose}
            >
              업데이트
            </Button>
          </Stack>
        </Card>
      </Box>
    </>
  );
}
