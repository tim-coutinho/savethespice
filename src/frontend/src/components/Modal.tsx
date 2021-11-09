import { CSSProperties, MouseEventHandler, ReactChild } from "react";

import Button from "./Button";

import "./Modal.scss";

// import { Color } from "../lib/common";

interface ModalProps {
  children: ReactChild;
  handleModalCancel: MouseEventHandler;
  handleModalSubmit: MouseEventHandler;
  handleModalThird?: MouseEventHandler;
  modalThirdText: string;
  modalCancelText?: string;
  modalSubmitText?: string;
  // primaryButtonColor: Color;
  // secondaryButtonColor: Color;
  style: CSSProperties;
  title: string;
  valid: boolean;
  thirdValid?: boolean;
  visible: boolean;
}

export default ({
  children,
  handleModalThird,
  handleModalCancel,
  handleModalSubmit,
  modalThirdText,
  modalCancelText = "Cancel",
  modalSubmitText = "Submit",
  // primaryButtonColor = Color.OD_PURPLE,
  // secondaryButtonColor = Color.WHITE,
  style,
  title,
  valid,
  thirdValid,
  visible,
}: ModalProps) => (
  <div className={`${visible ? "visible" : ""} modal`} style={style}>
    <div className="modal-title">{title}</div>
    {children}
    <div className="modal-btns">
      {handleModalThird && (
        <Button
          id="modal-cancel"
          classes="modal-btn"
          onClick={handleModalThird}
          // primaryColor={secondaryButtonColor}
          // secondaryColor={primaryButtonColor}
          disabled={!thirdValid}
          secondary
        >
          {modalThirdText}
        </Button>
      )}
      <Button
        id="modal-cancel"
        classes="modal-btn"
        onClick={handleModalCancel}
        // primaryColor={secondaryButtonColor}
        // secondaryColor={primaryButtonColor}
        secondary
      >
        {modalCancelText}
      </Button>
      <Button id="modal-submit" classes="modal-btn" onClick={handleModalSubmit} disabled={!valid}>
        {modalSubmitText}
      </Button>
    </div>
  </div>
);
