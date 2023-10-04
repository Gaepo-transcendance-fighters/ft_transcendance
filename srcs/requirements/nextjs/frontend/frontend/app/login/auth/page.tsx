"use client";

import { Box, Card, CircularProgress, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { main } from "@/font/color";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import secureLocalStorage from "react-secure-storage";

const server_domain = process.env.NEXT_PUBLIC_SERVER_URL_4000;

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  height: 350,
  bgcolor: main.main4,
  borderRadius: "15px",
  boxShadow: 24,
  p: 4,
};
interface Data {
  userIdx: number;
  nickname: string;
  intra: string;
  imgUri: string;
  token: string;
  email: string;
  check2Auth: boolean;
  available: boolean;
}

const Auth = () => {
  const searchParam = useSearchParams();
  const router = useRouter();
  const [client, setClient] = useState(false);
  const { authState, authDispatch } = useAuth();
  const { userDispatch } = useUser();

  const setupCookies = () => {
    let expire = new Date();

    expire.setTime(expire.getTime() + 30 * 60 * 1000);
    document.cookie = "login=1; path=/; expires=" + expire.toUTCString() + ";";
  };

  const postCode = async (code: string) => {
    console.log("👸🏻 [secondauth page.tsx] in second auth")
    await fetch(`${server_domain}/login/auth`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        code: code,
      }),
    })
      .then(async (res) => {
        if (res.status === 200) {
          const data: Data = await res.json();
          if (
            data.imgUri === `${server_domain}/img/0.png` &&
            authState.chatSocket
          )
            authState.chatSocket.emit("set_user_status", {
              userStatus: { nickname: data.nickname },
            });

          secureLocalStorage.setItem("token", data.token);
          secureLocalStorage.setItem("nickname", data.nickname);
          secureLocalStorage.setItem("imgUri", data.imgUri);
          secureLocalStorage.setItem("idx", data.userIdx.toString());
          secureLocalStorage.setItem("check2Auth", data.check2Auth.toString());
          secureLocalStorage.setItem("email", data.email);
          secureLocalStorage.setItem("available", data.available.toString());

          userDispatch({ type: "SET_USER_IDX", value: data.userIdx });
          userDispatch({ type: "CHANGE_NICK_NAME", value: data.nickname });
          userDispatch({
            type: "CHANGE_IMG",
            value: data.imgUri,
          });
          authDispatch({
            type: "SET_ID",
            value: data.userIdx,
          });
          authDispatch({
            type: "SET_NICKNAME",
            value: data.nickname,
          });
          authDispatch({
            type: "SET_IMGURL",
            value: data.imgUri,
          });
          authDispatch({
            type: "SET_AUTHORIZATION",
            value: data.token,
          });
          authDispatch({
            type: "SET_CHECK2AUTH",
            value: data.check2Auth,
          });
          authDispatch({
            type: "SET_EMAIL",
            value: data.email,
          });
          setupCookies();

          if (data.available && data.check2Auth === true)
            return router.replace("../secondauth");
          else if (data.available === false) return router.replace("../init");
          else 
          {
            console.log("👸🏻 [secondauth page.tsx] push /home");
            return router.replace(`/home`);
          }
        } else if (res.status === 400) {
          const message = await res.json().then((data) => data.message);
          alert(message);
          return router.replace("/login");
        } else {
        }
      })
      .catch((error) => {
        console.log(error);
        return alert(`[Error] ${error}`);
      });
  };

  useEffect(() => {
    const code = searchParam.get("code");
    if (!code) return;
    postCode(code);
  }, []);

  useEffect(() => {
    setClient(true);
  }, []);

  if (!client) return <></>;

  return (
    <Box>
      <Card sx={modalStyle}>
        <Typography sx={{ color: "white" }}>Loading...</Typography>
        <CircularProgress sx={{ color: "white" }} />
      </Card>
    </Box>
  );
};

export default Auth;
