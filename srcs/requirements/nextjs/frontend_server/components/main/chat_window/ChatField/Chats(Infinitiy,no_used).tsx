"use client";

import { Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";

const TOTAL_PAGES = 100;

const options = {
  threshold: 0.1,
};

interface ChatMessage {
  channelIdx: number;
  sender: string;
  msg: string;
}

const Chats = () => {
  const [loading, setLoading] = useState(true);
  const [pageNum, setPageNum] = useState(0);
  const [chats, setChats] = useState<ChatMessage[]>([]);
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
    console.log(pageNum);
    await axios
      // dev original
      .get(`http://localhost:4000/chat/messages?channelIdx=1&index=${pageNum}`)
      // haryu's server
        // .get(`http://paulryu9309.ddns.net:4000/chat/messages?channelIdx=1&index=${pageNum}`)
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
          flexDirection: "column-reverse",
          overflowY: "auto",
          overflowAnchor: "none",
          position: "sticky",
          margin: "1% 0% 1% 0%",
          padding: "2% 2% 0.5% 2%",
          height: "36vh",
        }}
      >
        {chats.map((chats, i) => {
          return (
            <div
              key={i}
              style={{
                listStyleType: "none",
                margin: "0px 0 0 0",
                color: "white",
                padding: 0,
              }}
            >
              <Typography variant="h6">
                {chats.sender + ": " + chats.msg}
              </Typography>
            </div>
          );
        })}
        <div ref={observerTarget}></div>
        {loading === true && <p>loading...</p>}
      </div>
    </>
  );
};

export default Chats;
