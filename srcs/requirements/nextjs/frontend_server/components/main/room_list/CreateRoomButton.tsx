"use client";

import { useState } from "react";
import CreateRoomModal from "./CreateRoomModal";

export default function CreateRoomButton({
  channelType,
}: {
  channelType: boolean;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = () => setOpen(true);

  return (
    <>
      {channelType ? (
        <>
          <button className="add" onClick={handleOpen}>
            +
          </button>
          <CreateRoomModal open={open} setOpen={setOpen} />
        </>
      ) : (
        ""
      )}
    </>
  );
}
