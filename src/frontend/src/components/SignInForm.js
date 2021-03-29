import React, { useEffect, useState, useCallback } from "react";
import { getById } from "../lib/common";

import Modal from "./Modal";
import TextInput from "./TextInput";

import "./SignInForm.scss";

export const Modes = {
  SIGN_UP: "Sign up",
  SIGN_IN: "Sign in",
  FORGOT_PASSWORD: "Forgot password",
};

export default ({ handleSignIn, handleSignUp, handleForgotPassword, pending }) => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState(Modes.SIGN_IN);
  const [authResponse, setAuthResponse] = useState("");

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
    setAuthResponse("");
  }, [mode]);

  return (
    <Modal
      handleModalThird={() => setMode(Modes.FORGOT_PASSWORD)}
      handleModalCancel={() => setMode(mode === Modes.SIGN_IN ? Modes.SIGN_UP : Modes.SIGN_IN)}
      handleModalSubmit={handleSubmit}
      modalThirdText={`${Modes.FORGOT_PASSWORD}?`}
      modalCancelText={`${mode === Modes.SIGN_IN ? Modes.SIGN_UP : Modes.SIGN_IN}?`}
      modalSubmitText={mode === Modes.FORGOT_PASSWORD ? "Send" : mode}
      title={mode}
      valid={isValid()}
      thirdValid={mode !== Modes.FORGOT_PASSWORD}
      visible
    >
      <div id="sign-in-form">
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
      </div>
    </Modal>
  );
};
