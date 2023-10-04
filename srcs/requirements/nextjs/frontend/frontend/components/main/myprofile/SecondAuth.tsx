"use client";

import { Button, Card, Box, CardContent, Modal } from "@mui/material";
import { useRouter } from "next/navigation";
import { main } from "@/type/type";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { IUserData, secondAuthModalStyle } from "@/type/My";
import secureLocalStorage from "react-secure-storage";

const server_domain = process.env.NEXT_PUBLIC_SERVER_URL_4000;

export default function SecondAuth({
  set2fa,
}: {
  set2fa: React.Dispatch<React.SetStateAction<IUserData>>;
}) {
  const [openModal, setOpenModal] = useState<boolean>(false);

  const [verified, setVerified] = useState<boolean>(false);
  const router = useRouter();

  const { authState, authDispatch } = useAuth();

  useEffect(() => {
    // const verified = authState.userInfo.check2Auth;
    // if (verified === "" || verified === null) return;

    setVerified(authState.userInfo.check2Auth);
  }, [authState.userInfo.check2Auth]);

  //값을 서버에서 받아오므로, useRef는 받아온 값으로 변경되어야할것.
  //useState로 초기값 설정해주고, 바뀐값을 전달만해줌?

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const onChangeSecondAuth = async () => {
    let newVerifiedValue = authState.userInfo.check2Auth;

    set2fa((prevState: IUserData) => ({
      ...prevState,
      check2Auth: !prevState.check2Auth,
    }));

    const response = await axios({
      method: "patch",
      url: `${server_domain}/users/profile/second`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          secureLocalStorage.getItem("token") as string
        }`,
      },
      data: {
        userIdx: Number(authState.userInfo.id),
        check2Auth: !newVerifiedValue,
      }, // 불리언 값을 JSON 문자열로 변환하여 전달
    }).then((res) => {
      if (res.status === 200) {
        setVerified(!newVerifiedValue);
        authDispatch({
          type: "SET_CHECK2AUTH",
          value: !newVerifiedValue,
        });
        setOpenModal(false);
      }
    });
  };

  return (
    <>
      <Button
        style={{
          minWidth: "max-content",
        }}
        variant="contained"
        onClick={handleOpenModal}
      >
        2차인증
      </Button>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={secondAuthModalStyle} borderRadius={"10px"}>
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
                disabled={verified}
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
                disabled={!verified}
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
