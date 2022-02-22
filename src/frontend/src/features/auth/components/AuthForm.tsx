import { Autocomplete, Group, Modal, PasswordInput, Tab, Tabs, Text } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import { useNotifications } from "@mantine/notifications";
import { Cross2Icon, EnvelopeClosedIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { FlipButton } from "@/components/Elements/FlipButton";
import { useForgotPassword, useSignIn, useSignUp } from "@/features/auth";
import { currentViewState, signedInState } from "@/stores";
import { SignedInState, View } from "@/utils/common";

enum Mode {
  SIGN_IN,
  SIGN_UP,
  FORGOT_PASSWORD,
}

export function AuthForm(): ReactElement {
  const [authResponse, setAuthResponse] = useState("");
  const [signedIn, setSignedIn] = useRecoilState(signedInState);
  const currentView = useRecoilValue(currentViewState);
  const activeTab = useRef(Mode.SIGN_IN);
  const form = useForm({
    initialValues: { email: "", password: "", confirmPassword: "" },
  });
  const { showNotification } = useNotifications();

  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = ({ email, password }: typeof form.values) => {
    switch (activeTab.current) {
      case Mode.SIGN_IN:
        return signInMutation.mutate(
          { email, password },
          {
            onSuccess: () => setSignedIn(SignedInState.SIGNED_IN),
            onError: e => {
              e instanceof Error &&
                showNotification({ message: e.message, icon: <Cross2Icon />, color: "red" });
            },
          },
        );
      case Mode.SIGN_UP:
        return signUpMutation.mutate(
          { email, password },
          {
            onSuccess: ([message]) => {
              showNotification({ message, icon: <EnvelopeClosedIcon /> });
            },
            onError: e => {
              e instanceof Error &&
                showNotification({ message: e.message, icon: <Cross2Icon />, color: "red" });
            },
            onSettled: () => setSignedIn(SignedInState.SIGNED_OUT),
          },
        );
      case Mode.FORGOT_PASSWORD:
        return forgotPasswordMutation.mutate(email, {
          onSuccess: message => {
            showNotification({ message, icon: <EnvelopeClosedIcon /> });
          },
          onError: e => {
            e instanceof Error &&
              showNotification({ message: e.message, icon: <Cross2Icon />, color: "red" });
          },
          onSettled: () => setSignedIn(SignedInState.SIGNED_OUT),
        });
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

  const requestInProgress = useMemo(
    () => signInMutation.isLoading || signUpMutation.isLoading || forgotPasswordMutation.isLoading,
    [signInMutation.isLoading, signUpMutation.isLoading, forgotPasswordMutation.isLoading],
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
            loading={requestInProgress}
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