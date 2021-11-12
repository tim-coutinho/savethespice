import { ChangeEvent, ReactElement, useCallback, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { SignedInState, transitionDuration, View } from "../lib/common";
import { currentViewState, signedInState } from "../store";
import Button from "./Button";

import "./SignInForm.scss";

import TextInput from "./TextInput";
import { forgotPassword, signIn, signUp } from "../lib/operations";
import { useRenderTimeout } from "../lib/hooks";

enum Mode {
  SIGN_UP = "Sign up",
  SIGN_IN = "Sign in",
  FORGOT_PASSWORD = "Forgot password",
}

export default (): ReactElement => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState(Mode.SIGN_IN);
  const [authResponse, setAuthResponse] = useState("");
  const [signedIn, setSignedIn] = useRecoilState(signedInState);
  const currentView = useRecoilValue(currentViewState);
  const [visible, rendered, setVisible] = useRenderTimeout(transitionDuration);

  const handleSignIn = (email: string, password: string) => {
    setSignedIn(SignedInState.PENDING);
    return signIn(email, password)
      .then(userId => {
        if (!userId) {
          setSignedIn(SignedInState.SIGNED_OUT);
          return "";
        }
        setSignedIn(SignedInState.SIGNED_IN);
        return userId;
      })
      .catch(e => {
        setSignedIn(SignedInState.SIGNED_OUT);
        throw e;
      });
  };

  const handleSignUp = (email: string, password: string) => {
    setSignedIn(SignedInState.PENDING);
    return signUp(email, password)
      .then(res => {
        setSignedIn(SignedInState.SIGNED_OUT);
        return res;
      })
      .catch(e => {
        setSignedIn(SignedInState.SIGNED_OUT);
        throw e;
      });
  };

  const handleForgotPassword = (email: string) => {
    setSignedIn(SignedInState.PENDING);
    return forgotPassword(email)
      .then(res => {
        setSignedIn(SignedInState.SIGNED_OUT);
        return res;
      })
      .catch(e => {
        setSignedIn(SignedInState.SIGNED_OUT);
        throw e;
      });
  };

  const handleSubmit = () => {
    switch (mode) {
      case Mode.SIGN_UP:
        return handleSignUp(email, password)
          .then(res => setAuthResponse(res))
          .catch(res => setAuthResponse(res.message));
      case Mode.SIGN_IN:
        return handleSignIn(email, password).catch(({ message }) => setAuthResponse(message));
      case Mode.FORGOT_PASSWORD:
        return handleForgotPassword(email)
          .then(res => setAuthResponse(res))
          .catch(({ message }) => setAuthResponse(message));
    }
  };

  const isValid = useCallback(
    () =>
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email,
      ) &&
      (mode !== Mode.FORGOT_PASSWORD ? password.length >= 8 : true) &&
      (mode === Mode.SIGN_UP ? password === confirmPassword : true) &&
      signedIn !== SignedInState.PENDING,
    [email, password, signedIn, confirmPassword, mode],
  );

  useEffect(() => {
    setVisible(currentView === View.SIGN_IN);
  }, [currentView]);

  useEffect(() => {
    setAuthResponse("");
  }, [mode]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setEmail("");
    setConfirmPassword("");
    setPassword("");
    setAuthResponse("");
  }, [visible]);

  return (
    <div
      id="sign-in-modal"
      className={visible ? "visible" : ""}
      style={{ transitionDuration: `${transitionDuration}ms` }}
    >
      {rendered && (
        <>
          <div id="sign-in-modal-title">{mode}</div>
          <TextInput
            placeholder="Email"
            name="email"
            setValue={(e: KeyboardEvent & ChangeEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                if (isValid()) {
                  handleSubmit();
                }
                return;
              }
              setEmail(e.currentTarget.value);
            }}
            value={email}
          />
          {mode !== Mode.FORGOT_PASSWORD && (
            <TextInput
              placeholder="Password"
              name="password"
              setValue={(e: KeyboardEvent & ChangeEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  if (isValid()) {
                    handleSubmit();
                  }
                  return;
                }
                setPassword(e.currentTarget.value);
              }}
              value={password}
              type="password"
            />
          )}
          {mode === Mode.SIGN_UP && (
            <TextInput
              placeholder="Confirm password"
              name="confirmPassword"
              setValue={(e: KeyboardEvent & ChangeEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  if (isValid()) {
                    handleSubmit();
                  }
                  return;
                }
                setConfirmPassword(e.currentTarget.value);
              }}
              value={confirmPassword}
              type="password"
            />
          )}
          {authResponse && <span>{authResponse}</span>}
          <div id="sign-in-modal-btns">
            <Button
              id="sign-in-modal-btn-left"
              onClick={() => setMode(Mode.FORGOT_PASSWORD)}
              disabled={mode === Mode.FORGOT_PASSWORD}
              secondary
            >
              {`${Mode.FORGOT_PASSWORD}?`}
            </Button>
            <Button
              id="sign-in-modal-btn-middle"
              onClick={() => setMode(mode === Mode.SIGN_IN ? Mode.SIGN_UP : Mode.SIGN_IN)}
              secondary
            >
              {`${mode === Mode.SIGN_IN ? Mode.SIGN_UP : Mode.SIGN_IN}?`}
            </Button>
            <Button id="sign-in-modal-btn-right" onClick={handleSubmit} disabled={!isValid()}>
              {mode === Mode.FORGOT_PASSWORD ? "Send" : mode}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
