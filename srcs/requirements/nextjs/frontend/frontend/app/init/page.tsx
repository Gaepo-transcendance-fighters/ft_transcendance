"use client";

import {
  Button,
  Card,
  Box,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { main } from "@/type/type";
import React, { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { io } from "socket.io-client";
import { useUser } from "@/context/UserContext";

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

export default function InitUser() {
  const router = useRouter();
  const [block, setBlock] = useState<boolean>(false);
  const { authState, authDispatch } = useAuth();
  const { userDispatch } = useUser();
  const [inputNick, setInputNick] = useState<string>("");

  const sendUri = `${server_domain}/users/profile`;

  const handleOnInput = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/[^A-Za-z]/gi, "");
  };

  const SetNick = async () => {
    (document.getElementById("inputbox") as HTMLInputElement).value = "";
    await axios({
      method: "post",
      url: sendUri,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          secureLocalStorage.getItem("token") as string
        }`,
      },
      data: {
        userIdx: parseInt(secureLocalStorage.getItem("idx") as string),
        userNickname: inputNick,
        imgData: "",
      },
    }).then((response) => {
      if (response.status === 200 && response.data.result.nickname !== "") {
        secureLocalStorage.setItem("nickname", response.data.result.nickname);
        userDispatch({
          type: "CHANGE_NICK_NAME",
          value: response.data.result.nickname,
        });

        authDispatch({
          type: "SET_NICKNAME",
          value: response.data.result.nickname,
        });
        const socket = io(`${server_domain}/chat`, {
          query: { userId: secureLocalStorage.getItem("idx") as string },
          autoConnect: false,
        });

        const gameSocket = io(`${server_domain}/game/playroom`, {
          query: { userId: secureLocalStorage.getItem("idx") as string },
          autoConnect: false,
        });

        authDispatch({ type: "SET_CHAT_SOCKET", value: socket });
        authDispatch({ type: "SET_GAME_SOCKET", value: gameSocket });
        console.log("🙋🏻‍♂️ [app/init.tsx] go to home");
        return router.replace("/home");
      } else if (
        response.status === 200 &&
        response.data.result.nickname === ""
      ) {
        console.log("fail");
        alert("잘못된 입력입니다. 재시도 해주세요.");
        setBlock(false); // 여기서 비우기.
      } else {
        console.log("fail");
        alert("잘못된 입력입니다. 재시도 해주세요.");
        setBlock(false); // 여기서 비우기.
      }
    });
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
              <Typography>사용할 닉네임을 입력해주세요.</Typography>
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
                // maxLength={10}
                maxLength={6}
                style={{
                  width: "40%",
                  height: "32px",
                  fontSize: "15px",
                  border: 0,
                  borderRadius: "15px",
                  outline: "none",
                  paddingLeft: "10px",
                  backgroundColor: "#E9E9E9",
                }}
                onInput={handleOnInput}
                onChange={(event) => {
                  setInputNick(event?.target.value);
                }}
              />
              <Button
                style={{
                  border: "0.1px solid black",
                  backgroundColor: "lightGray",
                }}
                onClick={SetNick}
              >
                입력
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
}
