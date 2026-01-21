import { PropsWithChildren, createContext } from "react";
import { useModal } from "../hooks/useModal";
import AppModal from "../components/AppModal/AppModal";
import { ModalProps } from "../types/ModalProps";

interface ModalContext extends Partial<ModalProps> {
  handleModal: (content?: ModalProps) => void;
  isOpen: boolean;
}

const ModalContext = createContext<ModalContext>({
  title: "",
  subtitle: "",
  leftButtonTitle: "",
  rightButtonTitle: "",
  isOpen: false,
  variant: "default",
  handleModal() {
    return;
  },
});

const ModalProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const modalProps = useModal();
  return (
    <ModalContext.Provider value={modalProps}>
      <AppModal />
      {children}
    </ModalContext.Provider>
  );
};

export { ModalContext, ModalProvider };
