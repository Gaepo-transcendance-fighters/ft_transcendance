"use client";

import { Card, CardContent, Typography } from "@mui/material";
import { main } from "@/type/type";

const WaitAccept = ({ nickname }: { nickname: string | undefined }) => {
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
          <Typography>승낙대기</Typography>
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
          }}
        >
          <Typography>
            {nickname} 님 께 친선전 경기를 요청하였습니다.
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
          }}
          sx={{ display: "flex", gap: "20%", flexDirection: "row" }}
        ></CardContent>
      </Card>
    </>
  );
};

export default WaitAccept;
