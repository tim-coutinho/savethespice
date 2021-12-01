import { useCallback, useRef, useState } from "react";

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

export enum AsyncRequestStatus {
  IDLE = "idle",
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error",
}

interface AsyncRequest<T, E> {
  status: AsyncRequestStatus;
  value: T | null;
  error: E | null;
  reset: () => void;
}

export const useAsync = <T, S = undefined, E = string>(
  asyncFunction: (params: S) => Promise<T>,
): [(params?: S) => Promise<void>, AsyncRequest<T, E>] => {
  const [request, setRequest] = useState<AsyncRequest<T, E>>({
    status: AsyncRequestStatus.IDLE,
    value: null,
    error: null,
    reset: () => null,
  });
  const reset = () =>
    setRequest(prev => ({
      ...prev,
      status: AsyncRequestStatus.IDLE,
      value: null,
      error: null,
    }));

  const execute = useCallback(
    (params = undefined) => {
      setRequest({ status: AsyncRequestStatus.PENDING, value: null, error: null, reset });

      return asyncFunction(params)
        .then(response => {
          setRequest(prev => ({ ...prev, status: AsyncRequestStatus.SUCCESS, value: response }));
        })
        .catch(error => {
          setRequest(prev => ({ ...prev, status: AsyncRequestStatus.ERROR, error: error }));
        });
    },
    [asyncFunction],
  );

  return [execute, request];
};
