import { useMutation } from "react-query";

import { api, publicEndpointPrefix } from "@/lib/fetch";

const signUp = (email: string, password: string): Promise<[string, number]> => {
  const body = { email, password };

  return api
    .post<undefined, typeof body>(`${publicEndpointPrefix}auth/signup`, body)
    .then(([res, status]) => {
      if (status >= 400) {
        throw new Error(res.message);
      }
      return [res.message, status];
    });
};
type UseSignUpOptions = { email: string; password: string };

export const useSignUp = () =>
  useMutation(({ email, password }: UseSignUpOptions) => signUp(email, password));
