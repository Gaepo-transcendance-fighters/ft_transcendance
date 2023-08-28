"use client";

import { Typography } from "@mui/material";
import { Card } from "@mui/material";

import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";

import { main } from "@/type/type";
const TOTAL_PAGES = 100;

const options = {
  threshold: 0.1,
};

interface ChatMessage {
  channelIdx: number;
  sender: string;
  msg: string;
}

const MyGameLog = () => {
  const [loading, setLoading] = useState(true);
  const [pageNum, setPageNum] = useState(0);

  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [lastElement, setLastElement] = useState<HTMLDivElement | null>(null);

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setPageNum((num) => num + 1);
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
      //dev original
      .get(`http://localhost:4000/chat/messages?channelIdx=1&index=${pageNum}`)
      //haryu's server
      //.get(`http://paulryu9309.ddns.net:4000/chat/messages?channelIdx=1&index=${pageNum}`)
      .then((res) => {
        const newData = Array.isArray(res.data) ? res.data : [res.data];
        setChats((prevChats) => [...prevChats, ...newData]);
        setLoading(false);
      });
  }, [pageNum]);

  useEffect(() => {
    if (pageNum <= TOTAL_PAGES) {
      setTimeout(() => {
        callUser();
      }, 500);
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
          overflowY: "scroll",
          overflowAnchor: "none",
          position: "sticky",
          //   margin: "1% 0% 1% 0%",
          //   padding: "2% 2% 0.5% 2%",
          width: "100%",
        }}
      >
        {chats.map((chats, i) => {
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0px 0 0 0",
                color: "white",
                width: "80%",
                height: "100px",
                // backgroundColor: "#48a0ed",
                backgroundColor: main.main1,
              }}
            >
              <Card
                style={{
                  //   backgroundColor: "#86d8f7",
                  backgroundColor: main.main0,
                  border: "1px solid black",
                  width: "80%",
                  height: "80%",
                }}
              >
                <Typography variant="h6">
                  {chats.sender + ": " + chats.msg}
                </Typography>
              </Card>
            </div>
          );
        })}
        <div ref={observerTarget}></div>
        {loading === true && <p>loading...</p>}
      </div>
    </>
  );
};

export default MyGameLog;
