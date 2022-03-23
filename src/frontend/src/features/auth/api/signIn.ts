import { useMutation } from "react-query";
import { useSetRecoilState } from "recoil";

import { api, publicEndpointPrefix } from "@/lib/fetch";
import { signedInState } from "@/stores";
import { prefix } from "@/utils/common";

interface SignInResponseData {
  user: string;
  idToken: string;
  idTokenExpiryTimestamp: string;
  refreshToken: string;
}

const signIn = (email: string, password: string): Promise<void> => {
  const body = { email, password };

  return api
    .post<SignInResponseData, typeof body>(`${publicEndpointPrefix}auth/signin`, body)
    .then(([res, status]) => {
      if (status >= 400) {
        throw new Error(res.message);
      }
      const { idToken, refreshToken, idTokenExpiryTimestamp } = res.data;
      sessionStorage.setItem(`${prefix}idToken`, idToken);
      localStorage.setItem(`${prefix}idTokenExpiryTimestamp`, idTokenExpiryTimestamp);
      localStorage.setItem(`${prefix}refreshToken`, refreshToken);
    });
};

type UseSignInOptions = { email: string; password: string };

export const useSignIn = () => {
  const setSignedIn = useSetRecoilState(signedInState);

  return useMutation(({ email, password }: UseSignInOptions) => signIn(email, password), {
    onSuccess: () => setSignedIn(true),
  });
};
