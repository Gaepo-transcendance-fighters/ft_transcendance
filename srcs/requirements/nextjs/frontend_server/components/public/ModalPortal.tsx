import { useModalContext } from "@/context/ModalContext";
import { Dialog, DialogContent, Portal } from "@mui/material";

export const ModalPortal = () => {
  const { isOpen, modalData, closeModal } = useModalContext();

  if (!isOpen) {
    return <></>;
  }

  const { children } = modalData;

  return (
    <Dialog open={isOpen} onClose={closeModal}>
      <DialogContent>
        {/* The modal's content will be injected here */}
        {children}
      </DialogContent>
    </Dialog>
  );
};
