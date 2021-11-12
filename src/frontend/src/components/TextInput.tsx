import {
  FocusEventHandler,
  HTMLInputTypeAttribute,
  MouseEventHandler,
  ReactElement,
  ReactEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";

import "./TextInput.scss";

interface TextInputProps {
  name: string;
  placeholder: string;
  value: number | string | string[];
  setValue: ReactEventHandler<HTMLInputElement>;
  autofocus?: boolean;
  autofocusDelay?: number;
  id?: string;
  maxLength?: number;
  // ordered?: boolean;
  type?: HTMLInputTypeAttribute;
  valid?: () => [boolean, string];
  width?: string;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLDivElement>;
}

export default ({
  autofocus = false,
  autofocusDelay = 100,
  id,
  maxLength = -1,
  name,
  // ordered = false,
  placeholder,
  setValue,
  type = "text",
  valid = () => [true, ""],
  value,
  width = "15em",
  onBlur,
}: TextInputProps): ReactElement => {
  const mainRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  // const tagName = useRef(ordered ? "ol" : "ul");
  const [focused, setFocused] = useState(false);
  const [isValid, setIsValid] = useState(valid()[0]);
  const [reason, setReason] = useState(valid()[1]);

  // const handleSetItems = newItems => {
  //   setItems({ preventDefault: () => {}, target: { name, value: newItems } });
  // };

  // const handleChange = e => {
  //   e.preventDefault();
  //   console.log(items);
  //   handleSetItems([...items]);
  // };

  // useEffect(() => {
  //   document.execCommand("defaultParagraphSeparator", false, "li");
  // }, []);

  useEffect(() => {
    const [isValid_, reason_] = valid();
    setIsValid(isValid_);
    setReason(reason_);
  }, [valid, value]);

  useEffect(() => {
    autofocus &&
      setTimeout(() => (mainRef.current?.firstElementChild as HTMLElement).focus(), autofocusDelay);
  }, []);

  const resize: FocusEventHandler<HTMLInputElement> = ({ type }) => {
    if (mainRef.current === null || helpRef.current === null) {
      return;
    }
    if (!isValid && type === "blur" && value !== "") {
      helpRef.current.style.opacity = "1";
      helpRef.current.title = reason;
      mainRef.current.classList.add("invalid");
    } else {
      helpRef.current.style.opacity = "0";
      helpRef.current.title = "";
      mainRef.current.classList.remove("invalid");
    }
  };

  const clear: MouseEventHandler = ({ currentTarget: { previousSibling } }) => {
    if (Array.isArray(value)) {
      (mainRef.current?.firstElementChild as HTMLElement).innerHTML = "";
    } else {
      const a = new CustomEvent("onChange", {
        detail: {
          currentTarget: { name, value: "" },
        },
      });
      mainRef.current?.dispatchEvent(a);
      // setValue({
      //   currentTarget: { name, value: "" },
      //   preventDefault: () => {},
      // });
    }
    (previousSibling as HTMLElement)?.focus();
  };

  return (
    <div
      className="text-input"
      ref={mainRef}
      style={{ width, transitionDelay: focused ? `${autofocusDelay}ms` : "" }}
    >
      {Array.isArray(value) ? (
        <div
          style={{ width }}
          onFocus={() => setFocused(true)}
          onBlur={e => {
            onBlur?.(e);
            (mainRef.current?.firstElementChild as HTMLElement).innerText.trim() === "" &&
              ((mainRef.current?.firstElementChild as HTMLElement).innerHTML = "");
          }}
          onPaste={e => {
            const paste = e.clipboardData.getData("text");
            const selection = window.getSelection();
            if (!selection || !selection?.rangeCount) {
              return false;
            }
            selection.deleteFromDocument();
            selection.getRangeAt(0).insertNode(document.createTextNode(paste));
            selection.collapseToEnd();

            e.preventDefault();
          }}
          contentEditable
          suppressContentEditableWarning
        >
          {value.map(v => (
            <div key={v}>{v}</div>
          ))}
        </div>
      ) : (
        <input
          id={id}
          name={name}
          onFocus={e => {
            setFocused(true);
            resize(e);
          }}
          onBlur={e => {
            setFocused(false);
            resize(e);
            onBlur?.(e);
          }}
          onChange={setValue}
          onKeyDown={setValue}
          value={value}
          type={type}
          maxLength={maxLength}
        />
      )}
      <i className="fa fa-close" onClick={clear} />
      <label htmlFor={id}>
        {placeholder}
        <i className="far fa-question-circle fa-xs" ref={helpRef} />
      </label>
    </div>
  );
};
