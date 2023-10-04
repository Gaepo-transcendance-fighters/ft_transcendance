"use client";

import { Box, Button, Card, CardContent, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { main } from "@/type/type";
import React, { useState } from "react";
import axios from "axios";
import secureLocalStorage from "react-secure-storage";

const server_domain = process.env.NEXT_PUBLIC_SERVER_URL_4000;

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
  const { authState, authDispatch } = useAuth();
  const [inputnumber, setInputNumber] = useState<string>("");
  const router = useRouter();
  const sendUri = `${server_domain}/users/second`;
  
  const SendMail = async () => {
    const response = await axios({
      method: "POST",
      url: sendUri,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          secureLocalStorage.getItem("token") as string
        }`,
      },
      data: {
        userIdx: authState.userInfo.id,
        email: authState.userInfo.email,
      },
    });
    if (response.status == 200) setBlock(true);
    else console.log("재시도필요");
  };

  const SendInput = async () => {
    if (inputnumber.length !== 6) return; // <- 안내창띄우기

    (document.getElementById("inputbox") as HTMLInputElement).value = "";
    const response = await axios({
      method: "PATCH",
      url: `${server_domain}/users/second`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          secureLocalStorage.getItem("token") as string
        }`,
      },
      data: {
        // userIdx: secureLocalStorage.getItem("idx") as number,
        userIdx: authState.userInfo.id,
        code: Number(inputnumber),
      },
    });
    if (response.status == 200 && response.data.result.checkTFA) {
      return router.push("/home"); // <- 0920 "/" -> "/home" 으로 수정
    }
    // 라우터 연결 및 localstorage에 2차인증토큰값설정.
    else if (
      response.status == 200 &&
      response.data.result.checkTFA === false
    ) {
      console.log("fail");
      alert("잘못된 입력입니다. 재시도 해주세요.");
      setBlock(false); // 여기서 비우기.
    }
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
                id="inputbox"
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
                disabled={block == true ? false : true}
              />
              <Button
                style={{
                  border: "0.1px solid black",
                  backgroundColor: "lightGray",
                }}
                onClick={SendInput}
                disabled={block == true ? false : true}
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
