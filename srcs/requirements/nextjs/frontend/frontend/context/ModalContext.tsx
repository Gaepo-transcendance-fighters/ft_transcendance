import { ReactNode, FC, useState, useContext } from "react";
import { createContext } from "react";

type ModalData = {
  children?: ReactNode;
  onCancel?: () => unknown;
  onSubmit?: () => unknown;
};

const ModalContext = createContext<{
  isOpen: boolean;
  openModal: (modalData: ModalData) => unknown;
  closeModal: () => unknown;
  modalData: ModalData;
}>({} as any);

export const useModalContext = () => {
  return useContext(ModalContext);
};

export const ModalContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData>({});

  const openModal = ({ children, onCancel, onSubmit }: ModalData) => {
    setIsOpen(true);
    setModalData({
      children,
      onCancel,
      onSubmit,
    });
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalData({});
  };

  return (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal, modalData }}>
      {children}
    </ModalContext.Provider>
  );
};
