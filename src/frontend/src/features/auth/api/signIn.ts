import { useMutation } from "react-query";
import { useSetRecoilState } from "recoil";

import { AuthService } from "@/lib/fetch";
import { signedInState } from "@/stores";
import { prefix } from "@/utils/common";

type SignInOptions = { email: string; password: string };

const signIn = (body: SignInOptions): Promise<void> =>
  AuthService.signIn(body).then(res => {
    if (!res.data) {
      return;
    }
    const { idToken, refreshToken, idTokenExpiryTimestamp } = res.data;
    sessionStorage.setItem(`${prefix}idToken`, idToken);
    localStorage.setItem(`${prefix}idTokenExpiryTimestamp`, idTokenExpiryTimestamp);
    localStorage.setItem(`${prefix}refreshToken`, refreshToken);
  });

export const useSignIn = () => {
  const setSignedIn = useSetRecoilState(signedInState);

  return useMutation(signIn, { onSuccess: () => setSignedIn(true) });
};
