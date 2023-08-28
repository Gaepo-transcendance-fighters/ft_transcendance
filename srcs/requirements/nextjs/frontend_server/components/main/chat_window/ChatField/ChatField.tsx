"use client";

import { Box, Typography } from "@mui/material";

interface IChat {
  channelIdx: number;
  senderIdx: number;
  msg: string;
  msgDate: Date;
}

interface Props {
  msgs: IChat[];
}

const ChatField = ({ msgs }: Props) => {
  // console.log(msgs);
  return (
    <Box
      sx={{
        backgroundColor: "#3272D2",
        height: "40vh",
        borderRadius: "5px",
        listStyleType: "none",
        overflowY: "scroll",
        margin: "0% 2% 1% 2%",
      }}
    >
      {msgs.map((value, i) => {
        return (
          <ul
            key={i}
            style={{ margin: "1% 0% 1% 0%", padding: "2% 2% 0.5% 2%" }}
          >
            <li
              style={{
                listStyleType: "none",
                margin: "0px 0 0 0",
                color: "white",
                padding: 0,
              }}
            >
              {/* {value.name + ": " + value.message} */}
              {
                <Typography variant="h6">
                  {value.senderIdx + ": " + value.msg}
                </Typography>
              }
            </li>
          </ul>
        );
      })}
    </Box>
  );
};

export default ChatField;
