import { Autocomplete, Group, Modal, PasswordInput, Tab, Tabs, Text } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import { EnvelopeClosedIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { SignedInState, View } from "../lib/common";
import { forgotPassword, signIn, signUp } from "../lib/operations";
import { currentViewState, signedInState } from "../store";
import { FlipButton } from "./FlipButton";

enum Mode {
  SIGN_IN,
  SIGN_UP,
  FORGOT_PASSWORD,
}

export default function AuthForm(): ReactElement {
  const [authResponse, setAuthResponse] = useState("");
  const [signedIn, setSignedIn] = useRecoilState(signedInState);
  const currentView = useRecoilValue(currentViewState);
  const activeTab = useRef(Mode.SIGN_IN);
  const form = useForm({
    initialValues: { email: "", password: "", confirmPassword: "" },
  });

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
      .then(([res]) => {
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

  const handleSubmit = (values: typeof form.values) => {
    switch (activeTab.current) {
      case Mode.SIGN_IN:
        return handleSignIn(values.email, values.password).catch(({ message }) =>
          setAuthResponse(message),
        );
      case Mode.SIGN_UP:
        return handleSignUp(values.email, values.password)
          .then(res => setAuthResponse(res))
          .catch(res => setAuthResponse(res.message));
      case Mode.FORGOT_PASSWORD:
        return handleForgotPassword(values.email)
          .then(res => setAuthResponse(res))
          .catch(({ message }) => setAuthResponse(message));
    }
  };

  const invalidForm = useMemo(
    () =>
      !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        form.values.email,
      ) ||
      (activeTab.current !== Mode.FORGOT_PASSWORD && form.values.password.length < 8) ||
      (activeTab.current === Mode.SIGN_UP && form.values.confirmPassword !== form.values.password),
    [form.values.email, form.values.password, form.values.confirmPassword],
  );

  useEffect(() => {
    currentView !== View.AUTH && setTimeout(form.reset, 500);
  }, [currentView]);

  return (
    <Modal
      opened={currentView === View.AUTH}
      onClose={() => null}
      closeOnClickOutside={false}
      hideCloseButton
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Tabs
          active={activeTab.current}
          onTabChange={i => {
            setAuthResponse("");
            activeTab.current = i;
            form.reset();
          }}
          grow
        >
          <Tab label="Sign In">
            <Group direction="column" grow>
              <Autocomplete
                label="Email"
                placeholder="example@gmail.com"
                icon={<EnvelopeClosedIcon />}
                data={
                  form.values.email.trim().length > 0 && !form.values.email.includes("@")
                    ? ["gmail.com", "yahoo.com", "hotmail.com", "live.com"].map(
                        provider => `${form.values.email}@${provider}`,
                      )
                    : []
                }
                mt="xs"
                {...form.getInputProps("email")}
              />
              <PasswordInput
                label="Password"
                placeholder="********************"
                icon={<LockClosedIcon />}
                {...form.getInputProps("password")}
              />
            </Group>
          </Tab>
          <Tab label="Sign Up">
            <Group direction="column" grow>
              <Autocomplete
                label="Email"
                placeholder="example@gmail.com"
                icon={<EnvelopeClosedIcon />}
                data={
                  form.values.email.trim().length > 0 && !form.values.email.includes("@")
                    ? ["gmail.com", "yahoo.com", "hotmail.com", "live.com"].map(
                        provider => `${form.values.email}@${provider}`,
                      )
                    : []
                }
                mt="xs"
                {...form.getInputProps("email")}
              />
              <PasswordInput
                label="Password"
                placeholder="********************"
                icon={<LockClosedIcon />}
                {...form.getInputProps("password")}
              />
              <PasswordInput
                label="Confirm password"
                placeholder={"*".repeat(form.values.password.length)}
                icon={<LockClosedIcon />}
                disabled={form.values.password.length === 0}
                {...form.getInputProps("confirmPassword")}
              />
            </Group>
          </Tab>
          <Tab label="Forgot Password?">
            <Autocomplete
              label="Email"
              placeholder="example@gmail.com"
              icon={<EnvelopeClosedIcon />}
              data={
                form.values.email.trim().length > 0 && !form.values.email.includes("@")
                  ? ["gmail.com", "yahoo.com", "hotmail.com", "live.com"].map(
                      provider => `${form.values.email}@${provider}`,
                    )
                  : []
              }
              mt="xs"
              {...form.getInputProps("email")}
            />
          </Tab>
        </Tabs>
        <Group position="apart" mt="md">
          <Text color="red" size="sm">
            {authResponse}
          </Text>
          <FlipButton
            type="submit"
            loading={signedIn === SignedInState.PENDING}
            disabled={invalidForm || signedIn === SignedInState.SIGNED_IN}
            sx={theme => ({ transitionDuration: `${theme.other.transitionDuration}ms` })}
            border
          >
            {activeTab.current === Mode.SIGN_IN
              ? "Sign In"
              : activeTab.current === Mode.SIGN_UP
              ? "Sign Up"
              : "Send"}
          </FlipButton>
        </Group>
      </form>
    </Modal>
  );
}
