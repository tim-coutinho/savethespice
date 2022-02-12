import { useRef, useState } from "react";

export const useRenderTimeout = (timeout = 300): [boolean, boolean, (inView: boolean) => void] => {
  const inFlight = useRef<boolean>(false);
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);

  const setInView = (inView: boolean) => {
    setVisible(inView);
    if (inView) {
      inFlight.current = false;
      setRendered(true);
    } else {
      inFlight.current = true;
      setTimeout(() => inFlight.current && setRendered(false), timeout);
    }
  };
  return [visible, rendered, setInView];
};
