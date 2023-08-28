"use client";

import * as React from "react";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import Box from "@mui/material/Box";
import { useState, ChangeEvent } from "react";

export default function UseFormControl() {
  const [msg, setMsg] = useState<string>("");

  const changeMsg = (event: ChangeEvent<HTMLInputElement>) => {
    setMsg(event.target.value);
  };

  return (
    <Box component="form" noValidate autoComplete="off">
      <FormControl>
        <OutlinedInput
          style={{
            backgroundColor: "#1e4ca9",
            height: "5%",
            width: "45vw",
            margin: "8px",
            color: "white",
            marginTop: "3%",
          }}
          onChange={changeMsg}
          placeholder="Please enter message"
          inputProps={{
            style: {
              height: "10px",
            },
          }}
        />
      </FormControl>
    </Box>
  );
}
