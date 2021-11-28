import { ReactElement, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Autocomplete, Button, Group, Modal, PasswordInput, Tab, Tabs, Text } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import { EnvelopeClosedIcon, LockClosedIcon } from "@radix-ui/react-icons";

import { SignedInState, transitionDuration, View } from "../lib/common";
import { useRenderTimeout } from "../lib/hooks";
import { forgotPassword, signIn, signUp } from "../lib/operations";
import { currentViewState, signedInState } from "../store";

enum Mode {
  SIGN_IN,
  SIGN_UP,
  FORGOT_PASSWORD,
}

export default (): ReactElement => {
  const [authResponse, setAuthResponse] = useState("");
  const [signedIn, setSignedIn] = useRecoilState(signedInState);
  const currentView = useRecoilValue(currentViewState);
  const [visible, , setVisible] = useRenderTimeout(transitionDuration);
  const [activeTab, setActiveTab] = useState(Mode.SIGN_IN);
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
    switch (activeTab) {
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

  useEffect(() => {
    setVisible(currentView === View.SIGN_IN);
  }, [currentView]);

  useEffect(() => {
    form.reset();
  }, [activeTab]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    form.reset();
  }, [visible]);

  return (
    <Modal
      opened={visible}
      onClose={() => setVisible(false)}
      closeOnClickOutside={false}
      hideCloseButton
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Tabs
          active={activeTab}
          onTabChange={i => {
            setAuthResponse("");
            setActiveTab(i);
          }}
          grow
        >
          <Tab label="Sign In">
            <Group direction="column" grow>
              <Autocomplete
                label="Email"
                placeholder="example@gmail.com"
                icon={<EnvelopeClosedIcon />}
                value={form.values.email}
                onChange={value => form.setFieldValue("email", value)}
                data={
                  form.values.email.trim().length > 0 && !form.values.email.includes("@")
                    ? ["gmail.com", "yahoo.com", "hotmail.com", "live.com"].map(
                        provider => `${form.values.email}@${provider}`,
                      )
                    : []
                }
                mt="xs"
              />
              <PasswordInput
                label="Password"
                placeholder="********************"
                icon={<LockClosedIcon />}
                value={form.values.password}
                onChange={({ currentTarget: { value } }) => form.setFieldValue("password", value)}
              />
            </Group>
          </Tab>
          <Tab label="Sign Up">
            <Group direction="column" grow>
              <Autocomplete
                label="Email"
                placeholder="example@gmail.com"
                icon={<EnvelopeClosedIcon />}
                value={form.values.email}
                onChange={value => form.setFieldValue("email", value)}
                data={
                  form.values.email.trim().length > 0 && !form.values.email.includes("@")
                    ? ["gmail.com", "yahoo.com", "hotmail.com", "live.com"].map(
                        provider => `${form.values.email}@${provider}`,
                      )
                    : []
                }
                mt="xs"
              />
              <PasswordInput
                label="Password"
                placeholder="********************"
                icon={<LockClosedIcon />}
                value={form.values.password}
                onChange={({ currentTarget: { value } }) => form.setFieldValue("password", value)}
              />
              <PasswordInput
                label="Confirm password"
                placeholder={"*".repeat(form.values.password.length)}
                icon={<LockClosedIcon />}
                value={form.values.confirmPassword}
                onChange={({ currentTarget: { value } }) =>
                  form.setFieldValue("confirmPassword", value)
                }
                disabled={form.values.password.length === 0}
              />
            </Group>
          </Tab>
          <Tab label="Forgot Password?">
            <Autocomplete
              label="Email"
              placeholder="example@gmail.com"
              icon={<EnvelopeClosedIcon />}
              value={form.values.email}
              onChange={value => form.setFieldValue("email", value)}
              data={
                form.values.email.trim().length > 0 && !form.values.email.includes("@")
                  ? ["gmail.com", "yahoo.com", "hotmail.com", "live.com"].map(
                      provider => `${form.values.email}@${provider}`,
                    )
                  : []
              }
              mt="xs"
            />
          </Tab>
        </Tabs>
        <Group position="apart" mt="md">
          <Text color="red" size="sm">
            {authResponse}
          </Text>
          <Button
            type="submit"
            loading={signedIn === SignedInState.PENDING}
            disabled={
              !(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                  form.values.email,
                ) &&
                (activeTab === Mode.FORGOT_PASSWORD || form.values.password.length >= 8) &&
                (activeTab !== Mode.SIGN_UP || form.values.confirmPassword === form.values.password)
              ) || signedIn === SignedInState.SIGNED_IN
            }
            sx={{ float: "right", transitionDuration: `${transitionDuration}ms` }}
          >
            {activeTab === Mode.SIGN_IN
              ? "Sign In"
              : activeTab === Mode.SIGN_UP
              ? "Sign Up"
              : "Send"}
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
