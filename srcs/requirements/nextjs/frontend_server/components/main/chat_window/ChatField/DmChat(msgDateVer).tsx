"use client";

import { Box, Typography } from "@mui/material";
import { useRoom } from "@/context/RoomContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { IChat } from "@/type/type";
import axios from "axios";
import { useInitMsg } from "@/context/InitMsgContext";
import { IDMChatFromServer } from "@/type/RoomType";

interface Props {
  msgs: IChat[];
  setMsgs: Dispatch<SetStateAction<IChat[]>>;
}

const DmChatOld = ({ msgs, setMsgs }: Props) => {
  const [end, setEnd] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { roomState } = useRoom();
  const observerTarget = useRef(null);
  const [lastDate, setLastDate] = useState<string>();
  const { initMsgState } = useInitMsg();

  useEffect(() => {
    if (!observerTarget.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoading(true);
          callHistory();
        }
      }, {threshold: 0.1}
    );

    if (observerTarget.current) observer.observe(observerTarget.current);

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, loading]);

  const callHistory = useCallback(async () => {
    if (!lastDate) {
      setLoading(false);
      return;
    }
    await axios
      .get(
        // `http://localhost:4000/chat/messages?channelIdx=${roomState.currentRoom?.channelIdx}&msgDate=${lastDate}`
        `http://paulryu9309.ddns.net:4000/chat/messages?channelIdx=${roomState.currentRoom?.channelIdx}&msgDate=${lastDate}`
      )
      .then((res) => {
        const newData = Array.isArray(res.data) ? res.data : [res.data];
        if (newData.length === 0) {
          setEnd(true)
          return;
        }
        setLoading(false);
        setMsgs((prevMsgs) => [...prevMsgs, ...newData])
        const lastIdx = msgs.length - 1;
        const lastElement = msgs[lastIdx];
        setLastDate((prev) => lastElement.msgDate);
      });
  }, [lastDate, loading, msgs, end]);

  // 첫 메세지 20개 불러오는 로직
  useEffect(() => {
    if (!initMsgState.dmEnterEntry) return;
    const list: IChat[] = initMsgState.dmEnterEntry.message.map(
      (data: IDMChatFromServer) => {
        const payload: IChat = {
          channelIdx: initMsgState.dmEnterEntry?.channelIdx,
          senderIdx:
            data.sender === roomState.currentDmRoomMemberList?.userNickname1
              ? roomState.currentDmRoomMemberList?.userIdx1
              : roomState.currentDmRoomMemberList?.userIdx2,
          sender: data.sender,
          msg: data.msg,
          msgDate: data.msgDate,
        };
        return payload;
      }
    );
    if (roomState.currentRoom?.channelIdx) setMsgs([]);
    setMsgs((prevState) => {
      return [...prevState, ...list];
    });
  }, []);

  // 이전 대화기록을 불러오거나, 새로 채팅을 송수신하게되면 그때마다 불러와진 대화기록 중 제일 오래된 메세지의 Date를 가져온다.
  useEffect(() => {
    if (msgs.length > 0) {
      const lastIdx = msgs.length - 1;
      const lastElement = msgs[lastIdx];
      setLastDate(() => lastElement.msgDate);
    }
  }, [msgs, lastDate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column-reverse",
        overflowY: "scroll",
        overflowAnchor: "none",
        position: "sticky",
        backgroundColor: "#3272D2",
        height: "40vh",
        borderRadius: "5px",
        listStyleType: "none",
        margin: "0% 2% 1% 2%",
      }}
    >
      {msgs.map((value, i) => {
        return (
          <ul
            key={i}
            style={{ margin: "1% 0% 1% 0%", padding: "2% 2% 0.5% 2%" }}
          >
            <div
              style={{
                listStyleType: "none",
                margin: "0px 0 0 0",
                color: "white",
                padding: 0,
              }}
            >
              {
                <Typography variant="h6">
                  {value.senderIdx ===
                  roomState.currentDmRoomMemberList?.userIdx1
                    ? roomState.currentDmRoomMemberList?.userNickname1
                    : roomState.currentDmRoomMemberList?.userNickname2 +
                      ": " +
                      value.msg}
                </Typography>
              }
            </div>
          </ul>
        );
      })}
      <div ref={observerTarget}> </div>
      <Typography style={{ color: "white" }} component={"div"} align="center">
        this is top of the chat list...
      </Typography>
      {end === false && loading === true && (
        <Typography style={{ color: "white" }} component={"div"}>
          loading...
        </Typography>
      )}
    </Box>
  );
};

export default DmChatOld;
