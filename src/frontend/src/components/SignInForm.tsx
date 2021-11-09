import { ChangeEvent, ReactElement, useCallback, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { SignedInState, transitionDuration, useRenderTimeout, View } from "../lib/common";
import { currentViewState, signedInState } from "../store";
import Button from "./Button";

import "./SignInForm.scss";

import TextInput from "./TextInput";
import { forgotPassword, signUp } from "../lib/operations";

const Modes = {
  SIGN_UP: "Sign up",
  SIGN_IN: "Sign in",
  FORGOT_PASSWORD: "Forgot password",
};

interface SignInFormProps {
  handleSignIn: (email: string, password: string) => Promise<string>;
}

export default ({ handleSignIn }: SignInFormProps): ReactElement => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState(Modes.SIGN_IN);
  const [authResponse, setAuthResponse] = useState("");
  const [signedIn, setSignedIn] = useRecoilState(signedInState);
  const currentView = useRecoilValue(currentViewState);
  const [visible, rendered, setVisible] = useRenderTimeout(transitionDuration);

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
      case Modes.SIGN_UP:
        handleSignUp(email, password)
          .then(res => setAuthResponse(res))
          .catch(res => setAuthResponse(res.message));
        return;
      case Modes.SIGN_IN:
        handleSignIn(email, password).catch(({ message }) => setAuthResponse(message));
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
        email,
      ) &&
      (mode !== Modes.FORGOT_PASSWORD ? password.length >= 8 : true) &&
      (mode === Modes.SIGN_UP ? password === confirmPassword : true) &&
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
          {mode !== Modes.FORGOT_PASSWORD && (
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
          {mode === Modes.SIGN_UP && (
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
              onClick={() => setMode(Modes.FORGOT_PASSWORD)}
              disabled={mode === Modes.FORGOT_PASSWORD}
              secondary
            >
              {`${Modes.FORGOT_PASSWORD}?`}
            </Button>
            <Button
              id="sign-in-modal-btn-middle"
              onClick={() => setMode(mode === Modes.SIGN_IN ? Modes.SIGN_UP : Modes.SIGN_IN)}
              secondary
            >
              {`${mode === Modes.SIGN_IN ? Modes.SIGN_UP : Modes.SIGN_IN}?`}
            </Button>
            <Button id="sign-in-modal-btn-right" onClick={handleSubmit} disabled={!isValid()}>
              {mode === Modes.FORGOT_PASSWORD ? "Send" : mode}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
