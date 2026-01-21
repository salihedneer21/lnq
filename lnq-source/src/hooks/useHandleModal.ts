import { useContext } from "react";
import { ModalContext } from "../contexts/ModalContext";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type AppModal from "../components/AppModal/AppModal";

/**
 * @returns handleModal callback to show {@link AppModal}
 */
export const useHandleModal = () => {
  const { handleModal } = useContext(ModalContext);
  return handleModal;
};
