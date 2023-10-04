"use client";

import { Box, Typography } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { IChat } from "@/type/type";
import { useFriend } from "@/context/FriendContext";

interface Props {
  msgs: IChat[];
  setMsgs: Dispatch<SetStateAction<IChat[]>>;
}

const NonDmChat = ({ msgs, setMsgs }: Props) => {
  const { friendState } = useFriend();

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
              {
                <Typography variant="h6">
                  {value.sender +
                    ": " +
                    (friendState.blockList?.find(
                      (data) => data.blockedUserIdx === value.senderIdx
                    )
                      ? "this msg from blocked person"
                      : value.msg)}
                </Typography>
              }
            </div>
        );
      })}
    </Box>
  );
};

export default NonDmChat;
