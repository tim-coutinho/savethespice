import React from "react";

import Button from "./Button";

import "./Modal.scss";
// import { colors } from "../utils/common";

export default function Modal({
  children,
  handleModalCancel,
  handleModalSubmit,
  modalCancelText = "Cancel",
  modalSubmitText = "Submit",
  // primaryButtonColor = colors.OD_PURPLE,
  // secondaryButtonColor = colors.WHITE,
  style,
  title,
  valid,
  visible,
}) {
  return (
    <div className={`${visible ? "visible" : ""} modal`} style={style}>
      <span>{title}</span>
      {children}
      <div className="modal-btns">
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
}
