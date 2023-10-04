"use client";

import { Button, Card, CardContent, Typography } from "@mui/material";
import { useEffect } from "react";
import { IOnGame, main } from "@/type/type";
import { useAuth } from "@/context/AuthContext";
import secureLocalStorage from "react-secure-storage";
import { ReturnMsgDto } from "@/type/RoomType";

const InviteGame = ({ nickname, idx }: { nickname: string; idx: number }) => {
  const { authState } = useAuth();

  const handleYes = () => {
    if (!authState.chatSocket) return;
    authState.chatSocket.emit(
      "chat_invite_answer",
      {
        inviteUserIdx: idx,
        targetUserIdx: parseInt(secureLocalStorage.getItem("idx") as string),
        answer: true,
      },
      (res: any) => {
      }
    );
  };

  const handleNo = () => {
    if (!authState.chatSocket) return;
    authState.chatSocket.emit(
      "BR_set_status_online",
      {
        userNickname: authState.userInfo.nickname,
      },
      (ret: ReturnMsgDto) => {}
    );

    authState.chatSocket.emit(
      "chat_invite_answer",
      {
        inviteUserIdx: idx,
        targetUserIdx: parseInt(secureLocalStorage.getItem("idx") as string),
        answer: false,
      },
      (res: any) => {
      }
    );
  };

  useEffect(() => {
    if (!authState.chatSocket) return;
    const SetStatusOnline = (payload: IOnGame) => {};
    authState.chatSocket.on("BR_set_status_online", SetStatusOnline);
  }, []);

  return (
    <>
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
          <Typography>게임초대</Typography>
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
          backgroundColor: main.main2,
        }}
      >
        <CardContent
          style={{
            width: "100%",
            height: "20%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: main.main2,
          }}
        >
          <Typography>
            {nickname} 님께서 친선전 경기를 요청하셨습니다.
          </Typography>
        </CardContent>
        <CardContent
          style={{
            width: "60%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            backgroundColor: main.main2,
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
            onClick={handleYes}
          >
            수락
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
            onClick={handleNo}
          >
            거절
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default InviteGame;
