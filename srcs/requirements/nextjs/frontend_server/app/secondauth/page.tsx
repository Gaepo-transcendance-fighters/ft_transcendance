"use client";

import Image from "next/image";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

import { main } from "@/type/type";
import React, { useState, ChangeEvent } from "react";
import axios from "axios";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  height: 300,
  bgcolor: main.main4,
  borderRadius: "15px",
  boxShadow: 24,
  p: 4,
};

const SecondAuth = () => {
  const [block, setBlock] = useState<boolean>(false);
  const [inputnumber, setInputNumber] = useState<string>("");

  const SendMail = async () => {
    const response = await axios({
      method: "POST",
      url: `http://localhost:4000/users/second`,
      data: {
        // userIdx: localStorage.getItem("idx"),
        userIdx: Number(localStorage.getItem("idx")),

        email: localStorage.getItem("email"),
      },
    });
    if (response.status == 200) setBlock(true);
    else console.log("재시도필요");
  };

  const SendInput = async () => {
    if (inputnumber.length !== 6) return; // <- 안내창띄우기

    const response = await axios({
      method: "PATCH",
      url: `http://localhost:4000/users/second`,
      data: {
        // userIdx: localStorage.getItem("idx"),
        userIdx: Number(localStorage.getItem("idx")),
        code: Number(inputnumber),
      },
    });
    if (response.status == 200) console.log("success in check 2 auth");
    // 라우터 연결 및 localstorage에 2차인증토큰값설정.
    else console.log("fail");
    //재입력 필요
  };

  return (
    <Box>
      <Card sx={modalStyle}>
        <Stack
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            style={{ border: "1px solid black" }}
            onClick={SendMail}
            disabled={block == true ? true : false}
          >
            2차인증 메일 보내기
          </Button>
          <br />
          <br />
          <br />
          <Box
            sx={{
              position: "absolute" as "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "70%",
              height: "40%",
              bgcolor: "#65d9f9",
              border: "1px solid #000",
              boxShadow: 24,
              p: 4,
            }}
            borderRadius={"5%"}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              메일로 전송된 6자리 숫자를 입력해주세요.
            </CardContent>
            <Stack
              direction={"row"}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <input
                type="text"
                maxLength={6}
                style={{
                  width: "40%",
                  height: "32px",
                  fontSize: "15px",
                  border: 0,
                  borderRadius: "5px",
                  outline: "none",
                  paddingLeft: "10px",
                  backgroundColor: "#E9E9E9",
                }}
                onInput={(event) => {
                  const input = event.target as HTMLInputElement;
                  const value = input.value.replace(/[^0-9]/g, "");
                }}
                onChange={(event) => {
                  setInputNumber(event?.target.value);
                }}
              />
              <Button
                style={{
                  border: "0.1px solid black",
                  backgroundColor: "lightGray",
                }}
                onClick={SendInput}
              >
                입력
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default SecondAuth;
