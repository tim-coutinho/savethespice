import React, { useEffect, useRef, useState } from "react";
// import PropTypes from "prop-types";

import "./TextInput.scss";

export default function TextInput({
  autofocus = false,
  autofocusDelay = 100,
  id,
  maxLength = -1,
  name,
  placeholder,
  setValue,
  type = "text",
  valid = () => [true, ""],
  value,
  width = "15em",
}) {
  const mainRef = useRef(null);
  const helpRef = useRef(null);
  const [isValid, setIsValid] = useState(valid()[0]);
  const [reason, setReason] = useState(valid()[1]);

  useEffect(() => {
    const validity = valid();
    setIsValid(validity[0]);
    setReason(validity[1]);
  }, [valid, value]);

  useEffect(() => {
    autofocus && setTimeout(() => mainRef.current.firstChild.focus(), autofocusDelay);
  }, []);

  const resize = ({ type }) => {
    if (!isValid && type === "blur" && value !== "") {
      helpRef.current.style.opacity = 1;
      helpRef.current.title = reason;
      mainRef.current.classList.add("invalid");
    } else {
      helpRef.current.style.opacity = 0;
      helpRef.current.title = "";
      mainRef.current.classList.remove("invalid");
    }
  };

  const clear = ({ target: { previousSibling } }) => {
    setValue({ target: { name, value: "" }, preventDefault: () => {} });
    previousSibling.focus();
  };

  return (
    <div className="text-input" ref={mainRef} style={{ width }}>
      <input
        id={id}
        name={name}
        onBlur={resize}
        onChange={setValue}
        onKeyDown={setValue}
        onFocus={resize}
        value={value}
        type={type}
        maxLength={maxLength}
      />
      <i className="fa fa-close" onClick={clear} />
      <label htmlFor={id}>
        {placeholder}
        <i className="far fa-question-circle fa-xs" ref={helpRef} />
      </label>
    </div>
  );
}

// TextInput.propTypes = {
//   /* HMTL id of the textbox. */
//   id: PropTypes.string.isRequired,
//   /* Placeholder value to be displayed. Required because there's really no
//   point in using this component without a placeholder. */
//   placeholder: PropTypes.string.isRequired,
//   /* Function to set the value of the textbox. */
//   setValue: PropTypes.func.isRequired,
//   /* Optional function to run against the current value to determine validity. */
//   valid: (props, propName) => {
//     if (props[propName]) {
//       const ret = props[propName]("");
//       if (typeof ret !== "boolean") {
//         const [isValid, reason] = ret;
//         if (typeof isValid !== "boolean" || typeof reason !== "string") {
//           return new Error(
//             "valid should be a function returning either a boolean or an " +
//               "array of the form [boolean, string]"
//           );
//         }
//       }
//     }
//   },
//   /* Value of the textbox. */
//   value: PropTypes.string.isRequired,
// };
