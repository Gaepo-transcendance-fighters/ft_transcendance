"use client";

import * as React from "react";
import IconButton from "@mui/material/IconButton";
import { useState, forwardRef, useEffect } from "react";
import Stack from "@mui/material/Stack";
import { Modal } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import EditRoomModal from "./EditRoomModal";

const Bar = forwardRef((props: any, ref: any) => (
  <span {...props} ref={ref}>
    {props.children}
  </span>
));

export default function SettingIconButton({
  showAlert,
  setShowAlert,
}: {
  showAlert: boolean;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (showAlert) {
      const time = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => clearTimeout(time);
    }
  }, [showAlert]);

  return (
    <>
      <Stack direction="row" spacing={0}>
        <IconButton aria-label="setting" onClick={handleOpen}>
          <SettingsIcon />
        </IconButton>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Bar>
            <EditRoomModal
              prop={handleClose}
              showAlert={showAlert}
              setShowAlert={setShowAlert}
            />
          </Bar>
        </Modal>
      </Stack>
    </>
  );
}
