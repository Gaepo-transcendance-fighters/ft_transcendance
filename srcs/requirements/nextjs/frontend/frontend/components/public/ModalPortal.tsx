import { useModalContext } from "@/context/ModalContext";
import { Dialog, DialogContent, Portal } from "@mui/material";
import { main } from "@/font/color";

export const ModalPortal = () => {
  const { isOpen, modalData, closeModal } = useModalContext();

  if (!isOpen) {
    return <></>;
  }

  const { children } = modalData;

  return (
    <Dialog open={isOpen}>
      <DialogContent sx={{
            backgroundColor: main.main0,
            }}>
        {/* The modal's content will be injected here */}
        {children}
      </DialogContent>
    </Dialog>
  );
};
