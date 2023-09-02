"use client";

import {
  Button,
  Card,
  createTheme,
  Box,
  CardContent,
  Modal,
} from "@mui/material";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 350,
  height: 150,
  bgcolor: "#65d9f9",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const myProfileStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "75vw",
  height: "80%",
  bgcolor: "#65d9f9",
  border: "1px solid #000",
  boxShadow: 24,
  p: 4,
};

import { main } from "@/type/type";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function SecondAuth() {
  const [openModal, setOpenModal] = useState<boolean>(false);

  const [verified, setVerified] = useState<string>("");

  useEffect(() => {
    const verified = localStorage.getItem("check2Auth");
    if (!verified) return;
    setVerified(verified);
  }, []);

  //값을 서버에서 받아오므로, useRef는 받아온 값으로 변경되어야할것.
  //useState로 초기값 설정해주고, 바뀐값을 전달만해줌?

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const onChangeSecondAuth = async () => {
    if (verified === "true") {
      setVerified("false");
      localStorage.setItem("check2Auth", "false");
    } else if (verified === "false") {
      setVerified("true");
      localStorage.setItem("check2Auth", "true");
    }

    try {
      let boolval;
      if (verified === "true") boolval = true;
      else if (verified === "false") boolval = false;
      else throw new Error("Invalue check2Auth value");

      const response = await axios({
        method: "PATCH",
        url: "http://localhost:4000/users/profile",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          // userNickName: userData?.nickname,
          check2Auth: boolval,
        }),
      });
    } catch (error) {
      console.log("2차인증 시 에러발생");
    }

    location.reload();
    // setOpenModal(false);
    // console.log();
  };

  return (
    <>
      <Button
        type="button"
        style={{
          minWidth: "max-content",
        }}
        variant="contained"
        onClick={handleOpenModal}
      >
        2차인증
      </Button>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle} borderRadius={"10px"}>
          <Card
            style={{
              width: "100%",
              height: "20%",
              backgroundColor: main.main4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* 상단 안내메세지 */}
            <CardContent
              style={{
                width: "100%",
                height: "20%",
                backgroundColor: main.main4,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              2차인증 확인
            </CardContent>
          </Card>
          <Card
            style={{
              width: "100%",
              height: "90%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <CardContent
              style={{
                width: "100%",
                height: "20%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              2차인증을 활성화 시, 다음 로그인부터 적용됩니다.
              <br />
              (버튼 클릭 시 메인화면으로 돌아갑니다)
            </CardContent>
            <CardContent
              style={{
                width: "60%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
              sx={{ display: "flex", gap: "20%", flexDirection: "row" }}
            >
              <Button
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#49EC62",
                  border: "1px solid black",
                }}
                disabled={verified === "true" ? true : false}
                onClick={onChangeSecondAuth}
              >
                활성화
              </Button>
              <Button
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#FF6364",
                  border: "1px solid black",
                }}
                disabled={verified === "false" ? true : false}
                onClick={onChangeSecondAuth}
              >
                비활성화
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </>
  );
}
