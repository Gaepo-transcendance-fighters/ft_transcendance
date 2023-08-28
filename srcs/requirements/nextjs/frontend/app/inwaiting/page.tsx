"use client";

import {
  Button,
  Box,
  Modal,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

import { useState } from "react";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  height: 150,
  bgcolor: "#65d9f9",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

import { useRouter } from "next/navigation";
import { main } from "@/type/type";
import { useGame } from "@/context/GameContext";

const inwaiting = () => {
  const router = useRouter();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { state, dispatch } = useGame();

  const BackToMain = () => {
    router.push("/");
  };

  const handleOpenModal_redir = () => {
    setOpenModal(true);
    setTimeout(() => {
      {
        state.gameMode === "rank"
          ? router.push("./gameplaying")
          : router.push("./optionselect");
      }
    }, 2000);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Card sx={{ display: "flex" }}>
      <Stack
        sx={{
          width: "100%",
          height: "100vh",
          backgroundColor: main.main1,
          padding: 0,
          margin: 0,
        }}
      >
        <CardContent
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card
            style={{
              width: "40%",
              height: "10vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid black",
            }}
          >
            <Typography sx={{ fontSize: "2rem" }}>Select Game Mode</Typography>
          </Card>
        </CardContent>
        <CardContent
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card
            style={{
              width: "60%",
              height: "65vh",
              border: "2px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: main.main3,
            }}
          >
            <Typography sx={{ fontSize: "3rem" }}>
              상대방을 기다리고있습니다...
            </Typography>
            <Button variant="contained" onClick={handleOpenModal_redir}>
              큐가잡힌경우
            </Button>
            <Modal open={openModal}>
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
                      매칭되었습니다
                    </CardContent>
                  </CardContent>
                </Card>
                {state.gameMode == "rank" ? (
                  <>
                    {" "}
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
                          height: "40%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        잠시후 게임화면으로 이동합니다.
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
                    {" "}
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
                          height: "40%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        잠시후 옵션 선택으로 이동합니다.
                      </CardContent>
                    </Card>
                  </>
                )}
              </Box>
            </Modal>
          </Card>
        </CardContent>

        <CardContent
          style={{
            width: "100%",
            height: "30vh",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            style={{
              minWidth: "max-content",
              height: "50%",
              border: "2px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              backgroundColor: "White",
            }}
            onClick={BackToMain}
          >
            취소하고 메인으로가기
          </Button>
        </CardContent>
      </Stack>
    </Card>
  );
};
export default inwaiting;
