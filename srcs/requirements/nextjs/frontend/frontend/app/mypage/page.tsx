"use client";

import { ThemeProvider } from "@emotion/react";
import {
  Avatar,
  Button,
  Card,
  Box,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { IOnlineStatus, font, main } from "@/type/type";
import React, { useState, useEffect, ChangeEvent } from "react";
import MyGameLog from "@/components/main/myprofile/MyGameLog";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import SecondAuth from "@/components/main/myprofile/SecondAuth";
import { IUserData, myProfileStyle } from "@/type/My";
import Image from "next/image";
import secureLocalStorage from "react-secure-storage";

const server_domain = process.env.NEXT_PUBLIC_SERVER_URL_4000;

export default function PageRedir() {
  const router = useRouter();
  const { userState, userDispatch } = useUser();
  const { authState } = useAuth();
  const [userData, setUserData] = useState<IUserData>({
    available: false,
    check2Auth: false,
    createdAt: "",
    nickname: "",
    imgUri: "",
    win: 0,
    lose: 0,
    email: "",
    intra: "",
    isOnline: IOnlineStatus.ONLINE,
    rankpoint: 0,
    updatedAt: "",
    userIdx: 0,
  });

  const fetch = async () => {
    await axios({
      method: "get",
      url: `${server_domain}/users/profile`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          secureLocalStorage.getItem("token") as string
        }`,
      },
      data: {
        userNickname: userState.nickname,
      },
    })
      .then((response) => {
        console.log(response);
        setUserData(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetch();
  }, []);

  const OpenFileInput = () => {
    document.getElementById("file_input")?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    const files = event.target.files;
    if (files) {
      uploadImage(files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    // readAsDataURL을 사용해 이미지를 base64로 변환
    const dataUrl: string = await readFileAsDataURL(file);

    if (dataUrl === "") return;

    const formData = new FormData();

    formData.append("userIdx", authState.userInfo.id.toString() || "");
    formData.append("userNickname", "");
    formData.append("imgData", dataUrl);

    await axios({
      method: "post",
      url: `${server_domain}/users/profile`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          secureLocalStorage.getItem("token") as string
        }`,
      },
      data: formData,
    })
      .then((res) => {
        setUserData(res.data.result);
        userDispatch({ type: "CHANGE_IMG", value: res.data.result.imgUri });
      })
      .catch((error) => {
        console.error("업로드 실패", error);
      });
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    if (file.size > 2000000) {
      alert("더 작은 사이즈의 파일을 선택해주세요.");
      return new Promise(() => "");
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          resolve(e.target.result);
        } else {
          reject(new Error("FileReader error"));
        }
      };

      reader.onerror = (e) => {
        reject(new Error("FileReader error"));
      };

      reader.readAsDataURL(file);
    });
  };

  const BackToHome = () => {
    router.push("/home");
  };

  const RankImgSelect = (data: IUserData) => {
    if (data.rankpoint < 3000) return "./rank/exp_medal_bronze.png";
    else if (data.rankpoint >= 3000 && data.rankpoint < 3100)
      return "./rank/exp_medal_silver.png";
    else if (data.rankpoint >= 3100) return "./rank/exp_medal_gold.png";
  };

  const RankSrc = RankImgSelect(userData);

  return (
    <>
      <ThemeProvider theme={font}>
        <Card sx={{ display: "flex" }}>
          <Stack
            sx={{
              width: "10%",
              height: "100vh",
              backgroundColor: main.main3,
              padding: 0,
              margin: 0,
            }}
          >
            <Button
              variant="outlined"
              style={{ backgroundColor: "white", margin: "30px 0px 0px 30px" }}
              onClick={BackToHome}
            >
              홈으로 돌아가기
            </Button>
          </Stack>
          <Stack
            sx={{
              width: "80%",
              height: "100vh",
              backgroundColor: main.main3,
              padding: 0,
              margin: 0,
            }}
          >
            {/* 중앙에 위치한 스택에 올리는 메인 카드 */}
            <Card sx={myProfileStyle}>
              <Stack
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Stack
                  style={{
                    width: "57%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: main.main8,
                  }}
                >
                  <Card
                    sx={{
                      backgroundColor: main.main7,
                      width: "100%",
                      flexDirection: "row",
                      display: "flex",
                    }}
                    style={{ border: "1px solid black" }}
                  >
                    {/* 아바타박스 */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-around",
                        width: "100%",
                        height: "100%",
                        alignItems: "center",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          borderRadius: "4%",
                          display: "flex",
                          justifyContent: "space-around",
                          width: "150px",
                          height: "150px",
                          alignItems: "center",
                          overflow: "hidden",
                          border: "1px solid",
                        }}
                      >
                        <Image
                          src={userState.imgUri}
                          width={150}
                          height={150}
                          alt="my profile img"
                        />
                      </Box>
                    </Box>
                    {/* 이미지, 닉네임, 2차인증, */}
                    <Stack
                      sx={{
                        width: "70vw",
                        pb: 3,
                      }}
                      spacing={0.5}
                    >
                      <Typography
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        style={{ fontSize: "3rem" }}
                      >
                        {userState.nickname}
                      </Typography>
                      <Typography style={{ fontSize: "1.2rem" }}>
                        2차인증 여부 : {userData.check2Auth ? "Y" : "N"}
                      </Typography>
                      <Typography style={{ fontSize: "1.2rem" }}>
                        Email : {authState.userInfo.email}
                        {/* Email : {secureLocalStorage.getItem("email") as string} */}
                      </Typography>
                      {/* 버튼관련 스택 */}
                      <Stack
                        direction={"row"}
                        spacing={3}
                        padding={"17px 0px 0px 0px"}
                        // p={3}
                      >
                        <form>
                          {/* TODO : 버튼 배열 어떻게? */}
                          <Button
                            onClick={OpenFileInput}
                            style={{
                              minWidth: "max-content",
                            }}
                            variant="contained"
                          >
                            사진변경
                          </Button>
                          <input
                            type="file"
                            id="file_input"
                            name="Change_IMG"
                            style={{ display: "none" }}
                            accept="image/png, image/jpg, image/jpeg"
                            onChange={handleChange}
                          />
                        </form>
                        <SecondAuth set2fa={setUserData} />
                      </Stack>
                    </Stack>
                  </Card>
                  <br />
                  <Card
                    sx={{ backgroundColor: main.main7 }}
                    style={{ width: "100%", border: "1px solid black" }}
                  >
                    <CardContent sx={{ paddingBottom: 0 }}>
                      <Typography style={{ fontSize: "1.4rem" }}>
                        전적
                      </Typography>
                    </CardContent>
                    <Stack direction={"row"}>
                      {/* 이미지 */}
                      <Card
                        sx={{
                          margin: 1,
                          marginRight: 0,
                          width: "30%",
                        }}
                      >
                        <CardContent
                          sx={{
                            backgroundColor: main.main3,
                            height: "100%",
                            "&:last-child": { paddingBottom: "16px" },
                          }}
                        >
                          <img
                            src={RankSrc}
                            style={{
                              width: "50px",
                              height: "50px",
                              display: "block",
                              margin: "0 auto",
                            }}
                          ></img>
                        </CardContent>
                      </Card>
                      {/* !이미지 */}
                      <Card
                        sx={{
                          margin: 1,
                          width: "70%",
                          height: "60%",
                        }}
                      >
                        <CardContent
                          sx={{
                            backgroundColor: main.main3,
                            height: "100%",
                            "&:last-child": { paddingBottom: "16px" },
                          }}
                        >
                          <Typography margin={1}>
                            랭크(포인트) : {userData?.rankpoint}
                          </Typography>
                          <Typography margin={1}>
                            승률 :{" "}
                            {userData.win + userData.lose === 0
                              ? 0
                              : Math.floor(
                                  (userData.win /
                                    (userData.win + userData.lose)) *
                                    100
                                )}
                            %
                          </Typography>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Card>
                  <br />
                </Stack>
                {/* 전적기록파트 */}
                <Stack
                  style={{
                    width: "41%",
                    height: "100%",
                    backgroundColor: main.main7,
                    border: "1px solid black",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "4px",
                  }}
                >
                  <br />
                  <Card
                    sx={{
                      backgroundColor: main.main3,
                      height: "95%",
                      width: "95%",
                      overflowY: "scroll",
                    }}
                    id="logs"
                  >
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Card
                        sx={{ paddingBottom: 0 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "60%",
                          height: "30%",
                          backgroundColor: main.main7,
                          border: "2px solid black",
                        }}
                      >
                        <Typography style={{ fontSize: "1.7rem" }}>
                          전적 기록
                        </Typography>
                      </Card>
                    </Box>
                    <br />
                    <Box
                      sx={{
                        listStyleType: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <MyGameLog />
                    </Box>
                  </Card>
                </Stack>
              </Stack>
            </Card>
          </Stack>
          <Stack
            sx={{
              width: "10%",
              height: "100vh",
              backgroundColor: main.main3,
              padding: 0,
              margin: 0,
            }}
          ></Stack>
        </Card>
      </ThemeProvider>
    </>
  );
}
