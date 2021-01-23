import React, { useEffect, useRef, useState } from "react";

import TextInput from "./TextInput";

import "./AddFormList.scss";

export default function AddFormList({ name, items, setItems, visible, ordered = false }) {
  const listRef = useRef(null);
  const tagName = useRef(ordered ? "ol" : "ul");
  const [currentInput, setCurrentInput] = useState(0);
  const [caretPosition, setCaretPosition] = useState(0);

  const handleSetItems = newItems => {
    setItems({ preventDefault: () => {}, target: { name, value: newItems } });
  };

  const handleChange = e => {
    e.preventDefault();
    const newItems = [...items];
    newItems[currentInput] = e.target.value;
    handleSetItems(newItems);
  };

  const handleKeyDown = e => {
    const caret = e.target.selectionStart;
    setCaretPosition(caret);
    switch (e.key) {
      case "ArrowUp":
        setCurrentInput(Math.max(currentInput - 1, 0));
        break;
      case "ArrowDown":
        setCurrentInput(Math.min(currentInput + 1, items.length - 1));
        break;
      case "Backspace":
        if (currentInput !== 0 && (items[currentInput].length === 0 || caret === 0)) {
          e.preventDefault();
          const newItems = [...items];
          setCaretPosition(newItems[currentInput - 1].length);
          newItems[currentInput - 1] += newItems.splice(currentInput, 1);
          setCurrentInput(currentInput - 1);
          handleSetItems(newItems);
        }
        break;
      case "Enter":
        if (items[currentInput] !== "") {
          const newItems = [...items];
          newItems.splice(currentInput + 1, 0, newItems[currentInput].slice(caret));
          newItems[currentInput] = newItems[currentInput].slice(0, caret);
          setCaretPosition(0);
          setCurrentInput(currentInput + 1);
          handleSetItems(newItems);
        }
        break;
    }
  };

  useEffect(() => {
    if (!visible) {
      return;
    }
    listRef.current.children[currentInput]?.firstChild.focus();
    listRef.current.children[currentInput]?.firstChild.setSelectionRange(
      caretPosition,
      caretPosition
    );
  }, [currentInput]);

  return (
    <tagName.current ref={listRef}>
      {items.map((item, i) => (
        <li key={`${name + i}`}>
          <input
            onChange={handleChange}
            onFocus={() => setCurrentInput(i)}
            onKeyDown={handleKeyDown}
            type="text"
            value={item}
          />
        </li>
      ))}
    </tagName.current>
  );
}
