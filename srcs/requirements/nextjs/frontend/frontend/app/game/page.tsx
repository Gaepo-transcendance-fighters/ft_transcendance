"use client";

import {
  Button,
  Box,
  Card,
  CardContent,
  Stack,
  Modal,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { main } from "@/type/type";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import secureLocalStorage from "react-secure-storage";
// import { server_domain } from "../page";
import axios from "axios";
import { SpeedOption } from "@/type/type";
import { useAuth } from "@/context/AuthContext";
const server_domain = process.env.NEXT_PUBLIC_SERVER_URL_4000;

const infomodalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  height: 600,
  bgcolor: "#65d9f9",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

enum GameType {
  FRIEND,
  NORMAL,
  RANK,
}

const Game = () => {
  const router = useRouter();
  const { gameState, gameDispatch } = useGame();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [client, setClient] = useState<boolean>(false);
  const [cha, setCha] = useState<string>("");
  const { authState } = useAuth();

  const ClickNomalGame = () => {
    gameDispatch({ type: "SET_GAME_MODE", value: GameType.NORMAL });
    router.replace("/optionselect");
  };

  const ClickRankGame = async () => {
    gameDispatch({ type: "SET_GAME_MODE", value: GameType.RANK });
    await axios({
      method: "post",
      url: `${server_domain}/game/normal-match`,
      data: {
        gameType: GameType.RANK,
        userIdx: parseInt(secureLocalStorage.getItem("idx") as string),
        speed: SpeedOption.speed2,
        mapNumber: 1,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          authState.gameSocket?.connect();
          router.replace("/inwaiting");
        } else {
          console.log("게임방 생성 실패");
          router.replace("/home?from=game");
        }
      })
      .catch((err) => {
        console.log(err);
        router.replace("/home?from=game");
      });
  };

  const BackToMain = () => {
    router.replace("/home");
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    setClient(true);
    if (authState.gameSocket?.connected)
      console.log(`[game page]🥳 게임 소켓 연결 상태 Good!`)
    else
      console.log(`[game page]🥺 게임 소켓 연결 BAD...`)
  }, []);

  useEffect(() => {
    const random = Math.floor(Math.random() * 7) + 1;
    setCha(`/character/cha${random}.png`);
  }, [cha]);

  if (!client) return <></>;

  return (
    <Card sx={{ display: "flex" }}>
      <Stack
        sx={{
          backgroundImage: `url("/background.png")`,
          width: "100%",
          height: "100vh",
          padding: 0,
          margin: 0,
        }}
      >
        <Image
          src={cha}
          alt="gogoo1"
          width={500}
          height={500}
          style={{ zIndex: 0, position: "absolute", top: "20%", left: "33%" }}
        />
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
            <CardContent>
              <Button
                style={{
                  width: "3vw",
                  height: "5vh",
                  backgroundColor: "#F2CB03",
                  border: "1px solid black",
                  fontSize: "2.5rem",
                  color: "white",
                }}
                onClick={handleOpenModal}
              >
                ?
              </Button>
              <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={infomodalStyle} borderRadius={"10px"}>
                  <Card
                    style={{
                      width: "100%",
                      height: "10%",
                      backgroundColor: main.main4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography>How to?</Typography>
                  </Card>

                  <Card
                    style={{
                      width: "100%",
                      height: "85%",
                      display: "flex",
                      alignItems: "center",
                      flexDirection: "column",
                      padding: "10px 0px 0px 0px",
                      backgroundColor: main.main2,
                    }}
                  >
                    <CardContent
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                        padding: "10px 0px 0px 0px",
                        marginBottom: "10px",
                      }}
                    >
                      {/* 일반게임 */}
                      <Card
                        style={{
                          width: "30%",
                          height: "15%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: main.main3,
                        }}
                      >
                        <Typography>일반게임 안내</Typography>
                      </Card>
                      <br></br>
                      {/* 일반설명 */}
                      <Card
                        style={{
                          width: "80%",
                          height: "90%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          border: "1px solid black",
                        }}
                      >
                        <Typography>
                          <strong>일반 게임</strong>은 랭크 점수를 걸지 않고
                          상대와 겨루는 모드입니다. 이 모드에선 공의 스피드와
                          맵의 종류를 직접 고를 수 있고 각 옵션은 상대의 선택와
                          플레이어의 선택 중 랜덤으로 적용됩니다.
                        </Typography>
                      </Card>
                    </CardContent>

                    <CardContent
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                        padding: "10px 0px 0px 0px",
                      }}
                    >
                      {/* 랭크게임 */}
                      <Card
                        style={{
                          width: "25%",
                          height: "15%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: main.main3,
                        }}
                      >
                        <Typography>랭크게임 안내</Typography>
                      </Card>
                      <br></br>
                      {/* 랭크설명 */}
                      <Card
                        style={{
                          width: "80%",
                          height: "70%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          border: "1px solid black",
                        }}
                      >
                        <Typography>
                          <strong>랭크게임</strong>은 자신의 랭크 점수를 걸고
                          상대와 겨루는 모드입니다. 이 모드는 보통 공 속도와
                          기본 맵를 사용합니다.
                        </Typography>
                      </Card>
                    </CardContent>

                    <CardContent
                      style={{
                        width: "100%",
                        height: "40%",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                        padding: "10px 0px 0px 0px",
                      }}
                    >
                      <Button
                        style={{
                          width: "20%",
                          height: "50%",
                          border: "2px solid black",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "1.5rem",
                          backgroundColor: main.main1,
                        }}
                        onClick={handleCloseModal}
                      >
                        확인
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              </Modal>
            </CardContent>
          </Card>
        </CardContent>
        <CardContent>
          <Card
            style={{
              width: "100%",
              height: "65vh",
              boxShadow: "none",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              backgroundColor: "transparent",
            }}
          >
            <Button
              style={{
                width: "35%",
                height: "70%",
                border: "2px solid black",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                fontSize: "2rem",
                backgroundColor: main.main4,
                color: "white",
              }}
              onClick={ClickNomalGame}
            >
              Normal Game Play!
            </Button>

            <Button
              style={{
                width: "35%",
                height: "70%",
                border: "2px solid black",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                fontSize: "2rem",
                backgroundColor: main.main4,
                color: "white",
              }}
              onClick={ClickRankGame}
            >
              Rank Game Play!
            </Button>
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
              width: "30%",
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
            Back to Main
          </Button>
        </CardContent>
      </Stack>
    </Card>
  );
};
export default Game;
