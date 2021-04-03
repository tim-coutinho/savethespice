import React, { useContext, useEffect, useState, useCallback } from "react";
import { transitionDuration, useRenderTimeout, Views } from "../lib/common";
import { ViewContext } from "../lib/context";
import Button from "./Button";

import TextInput from "./TextInput";

import "./SignInForm.scss";

const Modes = {
  SIGN_UP: "Sign up",
  SIGN_IN: "Sign in",
  FORGOT_PASSWORD: "Forgot password",
};

export default ({ handleSignIn, handleSignUp, handleForgotPassword, pending }) => {
  const { currentView } = useContext(ViewContext);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState(Modes.SIGN_IN);
  const [authResponse, setAuthResponse] = useState("");
  const [visible, rendered, setVisible] = useRenderTimeout(transitionDuration);

  const handleSubmit = () => {
    switch (mode) {
      case Modes.SIGN_UP:
        handleSignUp(email, password)
          .then(res => setAuthResponse(res))
          .catch(res => setAuthResponse(res.message));
        return;
      case Modes.SIGN_IN:
        handleSignIn(email, password)
          .then(res => setAuthResponse(res))
          .catch(({ message }) => setAuthResponse(message));
        return;
      case Modes.FORGOT_PASSWORD:
        handleForgotPassword(email)
          .then(res => setAuthResponse(res))
          .catch(({ message }) => setAuthResponse(message));
        return;
      default:
        return;
    }
  };

  const isValid = useCallback(
    () =>
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
      ) &&
      (mode !== Modes.FORGOT_PASSWORD ? password.length >= 8 : true) &&
      (mode === Modes.SIGN_UP ? password === confirmPassword : true) &&
      !pending,
    [email, password, pending, confirmPassword, mode]
  );

  useEffect(() => {
    setVisible(currentView === Views.SIGN_IN);
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
      id="sign-in-form"
      className={visible ? "visible" : ""}
      style={{ transitionDuration: `${transitionDuration}ms` }}
    >
      {rendered && (
        <>
          <div id="sign-in-form-title">{mode}</div>
          <TextInput
            placeholder="Email"
            name="email"
            setValue={e => {
              if (e.key === "Enter") {
                if (isValid()) {
                  handleSubmit();
                }
                return;
              }
              setEmail(e.target.value);
            }}
            value={email}
          />
          {mode !== Modes.FORGOT_PASSWORD && (
            <TextInput
              placeholder="Password"
              name="password"
              setValue={e => {
                if (e.key === "Enter") {
                  if (isValid()) {
                    handleSubmit();
                  }
                  return;
                }
                setPassword(e.target.value);
              }}
              value={password}
              type="password"
            />
          )}
          {mode === Modes.SIGN_UP && (
            <TextInput
              placeholder="Confirm password"
              name="confirmPassword"
              setValue={e => {
                if (e.key === "Enter") {
                  if (isValid()) {
                    handleSubmit();
                  }
                  return;
                }
                setConfirmPassword(e.target.value);
              }}
              value={confirmPassword}
              type="password"
            />
          )}
          {authResponse && <span>{authResponse}</span>}
          <div id="sign-in-form-btns">
            <Button
              id="sign-in-form-btn-left"
              onClick={() => setMode(Modes.FORGOT_PASSWORD)}
              disabled={mode === Modes.FORGOT_PASSWORD}
              secondary
            >
              {`${Modes.FORGOT_PASSWORD}?`}
            </Button>
            <Button
              id="sign-in-form-btn-middle"
              onClick={() => setMode(mode === Modes.SIGN_IN ? Modes.SIGN_UP : Modes.SIGN_IN)}
              secondary
            >
              {`${mode === Modes.SIGN_IN ? Modes.SIGN_UP : Modes.SIGN_IN}?`}
            </Button>
            <Button id="sign-in-form-btn-right" onClick={handleSubmit} disabled={!isValid()}>
              {mode === Modes.FORGOT_PASSWORD ? "Send" : mode}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
