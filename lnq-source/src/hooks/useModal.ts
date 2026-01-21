import { useCallback, useState } from "react";
import { ModalProps } from "../types/ModalProps";

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [props, setProps] = useState<ModalProps>();
  const handleModal = useCallback(
    (content?: ModalProps) => {
      setIsOpen(!isOpen);
      if (content) {
        setProps({
          ...content,
          variant: content.variant ?? "default",
          onClickRightButton: content.onClickRightButton
            ? () => {
                setIsOpen(false);
                content.onClickRightButton?.();
              }
            : undefined,
          onClickLeftButton: () => {
            setIsOpen(false);
            content?.onClickLeftButton?.();
          },
        });
      }
    },
    [isOpen],
  );

  return {
    handleModal,
    isOpen,
    ...props,
  };
};
