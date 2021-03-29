import React from "react";

import Button from "./Button";

import "./Modal.scss";
// import { colors } from "../lib/common";

export default function Modal({
  children,
  handleModalThird,
  handleModalCancel,
  handleModalSubmit,
  modalThirdText,
  modalCancelText = "Cancel",
  modalSubmitText = "Submit",
  // primaryButtonColor = colors.OD_PURPLE,
  // secondaryButtonColor = colors.WHITE,
  style,
  title,
  valid,
  thirdValid,
  visible,
}) {
  return (
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
}
