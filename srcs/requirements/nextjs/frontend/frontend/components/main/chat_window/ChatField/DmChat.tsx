"use client";

import { useInitMsg } from "@/context/InitMsgContext";
import { useRoom } from "@/context/RoomContext";
import { useFriend } from "@/context/FriendContext"
import { IDMChatFromServer } from "@/type/RoomType";
import { IChat } from "@/type/type";
import { Box, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState, useRef, useCallback, lazy } from "react";
import { Dispatch, SetStateAction } from "react";

const server_domain = process.env.NEXT_PUBLIC_SERVER_URL_4000;

const options = {
  threshold: 0.1,
};

interface Props {
  msgs: IChat[];
  setMsgs: Dispatch<SetStateAction<IChat[]>>;
}

const DmChats = ({ msgs, setMsgs }: Props) => {
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(0);
  const { roomState } = useRoom();
  const { initMsgState } = useInitMsg();
  const { friendState } = useFriend();
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setPageNum((num) => num - 1);
      }
    }, options);

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget]);

  const callUser = useCallback(async () => {
    await axios
      .get(
        `${server_domain}/chat/messages?channelIdx=${roomState.currentRoom?.channelIdx}&page=${pageNum}`
      )
      .then((res) => {
        const newData = Array.isArray(res.data) ? res.data : [res.data];
        setMsgs((prevMsgs) => [...prevMsgs, ...newData]);
        setLoading(false);
      });
  }, [pageNum]);

  useEffect(() => {
    if (pageNum > 0) {
      setTimeout(() => {
        callUser();
      }, 100);
      setLoading(true);
    }
  }, [pageNum]);

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
    if (roomState.currentRoom?.channelIdx) {
      setMsgs([]);
    }
    setMsgs((prevState) => {
      return [...prevState, ...list];
    });
    let calPage = Math.floor(initMsgState.dmEnterEntry.totalMsgCount / 5);
    if (initMsgState.dmEnterEntry.totalMsgCount % 5 !== 0) calPage += 1;
    setPageNum(calPage - 4);
  }, [roomState.currentRoom?.channelIdx]);

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
          <div
            key={i}
            style={{
              listStyleType: "none",
              margin: "0px 0 0 0",
              color: "white",
              padding: "2% 0% 0% 2%"
            }}
          >
            <Typography variant="h6">
              {(value.senderIdx === roomState.currentDmRoomMemberList?.userIdx1
                ? `${roomState.currentDmRoomMemberList?.userNickname1}: ` + 
                (friendState.blockList?.find(
                  (data) => data.blockedUserIdx === roomState.currentDmRoomMemberList?.userIdx1
                )
                  ? "this msg from blocked person"
                  : value.msg)
                : `${roomState.currentDmRoomMemberList?.userNickname2}: ` + 
                (friendState.blockList?.find(
                  (data) => data.blockedUserIdx === roomState.currentDmRoomMemberList?.userIdx2
                )
                  ? "this msg from blocked person"
                  : value.msg))
              }
            </Typography>
          </div>
        );
      })}
      <div ref={observerTarget}></div>
      {loading === true && (
        <Typography style={{ color: "white" }} align="center" component={"div"}>
          loading...
        </Typography>
      )}
      {loading === false && (
        <Typography style={{ color: "white" }} component={"div"} align="center">
          this is top of the chat list...
        </Typography>
      )}
    </Box>
  );
};

export default DmChats;
