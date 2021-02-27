import React, { useEffect, useState } from "react";

import Modal from "./Modal";
import TextInput from "./TextInput";

import "./SignInForm.scss";

export default ({ handleSignIn, handleSignUp }) => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUp, setSignUp] = useState(false);
  const [signUpState, setSignUpState] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setSignUpState("");
  }, [signUp]);

  return (
    <Modal
      handleModalCancel={() => setSignUp(!signUp)}
      handleModalSubmit={() => {
        setPending(true);
        signUp
          ? handleSignUp(email, password)
              .then(res => {
                setSignUpState(res);
              })
              .catch(setSignUpState)
              .finally(() => setPending(false))
          : handleSignIn(email, password)
              .catch(({ message }) => setSignUpState(message))
              .finally(() => setPending(false));
      }}
      modalCancelText={signUp ? "Sign in?" : "Sign up?"}
      modalSubmitText={signUp ? "Sign up" : "Sign in"}
      title={signUp ? "Sign up:" : "Sign in:"}
      valid={
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          email
        ) &&
        password.length >= 8 &&
        (signUp ? password === confirmPassword : true) &&
        !pending
      }
      visible
    >
      <TextInput
        placeholder="Email"
        name="email"
        setValue={e => setEmail(e.target.value)}
        value={email}
      />
      <TextInput
        placeholder="Password"
        name="password"
        setValue={e => setPassword(e.target.value)}
        value={password}
        type="password"
      />
      {signUp && (
        <TextInput
          placeholder="Confirm password"
          name="confirmPassword"
          setValue={e => setConfirmPassword(e.target.value)}
          value={confirmPassword}
          type="password"
        />
      )}
      {signUpState && <span>{signUpState}</span>}
    </Modal>
  );
};
