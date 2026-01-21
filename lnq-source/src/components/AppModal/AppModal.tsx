import { useContext } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import ModalContainer from "../ModalContainer/ModalContainer";

/**
 * Uses {@link ModalContainer} and {@link ModalContext}'s "handleModal" to provide a
 * a globally accessible basic modal.
 */
const AppModal: React.FC = () => {
  const { handleModal, ...props } = useContext(ModalContext);
  return (
    <ModalContainer
      {...props}
      title={props.title ?? ""}
      leftButtonTitle={props.leftButtonTitle ?? ""}
      rightButtonTitle={props.rightButtonTitle ?? ""}
      onClose={handleModal}
    />
  );
};

export default AppModal;
