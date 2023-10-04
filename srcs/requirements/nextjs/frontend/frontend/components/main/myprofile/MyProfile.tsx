"use client";

import { main } from "@/font/color";
import { Button, Card, ThemeProvider, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { font } from "@/type/type";
import Image from "next/image";

const Myprofile = () => {
  const router = useRouter();
  const searchparams = useSearchParams();
  const { userState } = useUser();

  const createQuery = useCallback(
    (nickname: string) => {
      const params = new URLSearchParams(searchparams.toString());
      params.set("name", nickname);

      return params.toString();
    },
    [searchparams]
  );

  const RedirMyprofile = () => {
    router.push("./mypage" + "?" + createQuery(userState.nickname));
  };

  return (
    <ThemeProvider theme={font}>
      <div
        style={{
          padding: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            borderRadius: "10px",
            height: "150px",
            width: "150px",
            overflow: "hidden",
            margin: "auto",
          }}
        >
          {userState.imgUri ? (
            <Image
              src={userState.imgUri}
              width={150}
              height={150}
              alt="main my profile img"
            />
          ) : null}
        </div>
        <div style={{ padding: 10 }}>
          <Card
            style={{
              height: "4vh",
              width: "50%",
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
              alignItems: "center",
              margin: "0 auto",
              backgroundColor: main.main1,
              border: "1px solid black",
            }}
          >
            <Typography
              color={"#Black"}
              fontSize={"large"}
              align="center"
              sx={{
                verticalAlign: "middle",
              }}
            >
              {userState.nickname}
            </Typography>
          </Card>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            type="button"
            onClick={RedirMyprofile}
            style={{
              backgroundColor: "WHITE",
              height: "4vh",
              width: "25%",
              border: "1px solid black",
            }}
          >
            더보기
          </Button>
        </div>
      </div>
    </ThemeProvider>
  );
};
export default Myprofile;
