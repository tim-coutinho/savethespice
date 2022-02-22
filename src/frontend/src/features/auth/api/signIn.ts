import { useMutation } from "react-query";

import { api } from "@/lib/fetch";
import { prefix } from "@/utils/common";

interface SignInResponseData {
  idToken: string;
  refreshToken: string;
  user: string;
}

const signIn = (email: string, password: string): Promise<string> => {
  const body = { email, password };

  return api.post<SignInResponseData, typeof body>("auth/signin", body).then(([res, status]) => {
    if (status >= 400) {
      throw new Error(res.message);
    }
    const { idToken, refreshToken, user } = res.data;
    localStorage.setItem(`${prefix}refreshToken`, refreshToken);
    sessionStorage.setItem(`${prefix}idToken`, idToken);
    return user;
  });
};

type UseSignInOptions = { email: string; password: string };

export const useSignIn = () =>
  useMutation(({ email, password }: UseSignInOptions) => signIn(email, password));
