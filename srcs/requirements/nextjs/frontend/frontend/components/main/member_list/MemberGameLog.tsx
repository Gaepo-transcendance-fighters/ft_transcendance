"use client";

import { Typography } from "@mui/material";
import axios from "axios";
import {
  useEffect,
  useState,
  useRef,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { main } from "@/type/type";
import { useUser } from "@/context/UserContext";
import { IMember } from "@/type/RoomType";
import { IGameRecord, IGameUserInfo, gameLogOptions } from "@/type/GameType";
import secureLocalStorage from "react-secure-storage";

const server_domain = process.env.NEXT_PUBLIC_SERVER_URL_4000;

const MemberGameLog = ({
  person,
  gameRecordData,
  setGameRecordData,
  setGameUserInfo,
}: {
  person: IMember;
  gameRecordData: IGameRecord[];
  setGameRecordData: Dispatch<SetStateAction<IGameRecord[]>>;
  setGameUserInfo: Dispatch<SetStateAction<IGameUserInfo | null>>;
}) => {
  const [loading, setLoading] = useState(true);
  const [end, setEnd] = useState(false);
  const [pageNum, setPageNum] = useState(0);
  const { userState } = useUser();
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setPageNum((num) => num + 1);
      }
    }, gameLogOptions);

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, loading]);

  const callUser = useCallback(async () => {
    await axios
      .get(
        `${server_domain}/game/records?userIdx=${person.userIdx}&page=${pageNum}`,
        {
          headers: {
            Authorization: ("Bearer " +
              secureLocalStorage.getItem("token")) as string,
          },
        }
      )
      .then((res) => {
        setGameUserInfo(res.data.userInfo);
        if (res.data.gameRecord.length > 0) {
          const newData = res.data.gameRecord;
          setGameRecordData((prevRecord) => [...prevRecord, ...newData]);
          setLoading(false);
        } else {
          setLoading(false);
          setEnd(true);
        }
      });
  }, [pageNum]);

  useEffect(() => {
    if (end === false) {
      // callUser();
      setTimeout(callUser, 1000);
      setLoading(true);
    }
  }, [pageNum]);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          // overflowY: "scroll",
          overflowAnchor: "none",
          position: "sticky",
          width: "100%",
          height: "70%",
        }}
      >
        {gameRecordData.map((gameRecordData, i) => {
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "10px 0 0 0",
                color: "black",
                width: "80%",
                height: "70%",
                border: "1px solid black",
                backgroundColor: main.main1,
                borderRadius: "5px",
              }}
            >
              {/* 내부에 작은 박스 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0px 0 0 0",
                  color: "black",
                  width: "90%",
                  height: "80%",
                  backgroundColor: main.main0,
                  borderRadius: "5px",
                }}
              >
                {/* 내부에서 공간을 나눠야함 */}
                {/* 왼쪽박스 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    width: "30%",
                    height: "80%",
                    backgroundColor: main.main0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      width: "80%",
                      height: "40%",
                      backgroundColor: main.main0,
                    }}
                  >
                    <Typography sx={{ fontSize: "1.1rem" }}>
                      {gameRecordData.type === 0 ? <>Normal</> : <>Rank</>}
                    </Typography>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      width: "80%",
                      height: "40%",
                      backgroundColor: main.main0,
                    }}
                  >
                    <Typography sx={{ fontSize: "1.1rem" }}>
                      {gameRecordData.result === 2 ? (
                        <>Win</>
                      ) : gameRecordData.result === 3 ? (
                        <>Lose</>
                      ) : (
                        <>Draw</>
                      )}
                    </Typography>
                  </div>
                </div>
                {/* 오른쪽박스 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "80%",
                    height: "80%",
                    backgroundColor: main.main0,
                  }}
                >
                  <Typography sx={{ fontSize: "1.5rem" }}>
                    {/* 내닉네임 | 점수 : 점수 | 상대닉네임 */}
                    {person.nickname}{" "}
                    {gameRecordData.score ? gameRecordData.score : "0 : 0"}{" "}
                    {gameRecordData.matchUserNickname}
                  </Typography>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={observerTarget}></div>
        {loading === true && (
          <Typography component={"div"}>loading...</Typography>
        )}
        {loading === false && (
          <Typography component={"div"}>end of list...</Typography>
        )}
      </div>
    </>
  );
};

export default MemberGameLog;
