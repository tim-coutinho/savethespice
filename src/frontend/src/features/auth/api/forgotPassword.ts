import { useMutation } from "react-query";

import { api, publicEndpointPrefix } from "@/lib/fetch";

const forgotPassword = (email: string): Promise<string> => {
  const body = { email };

  return api
    .post<undefined, typeof body>(`${publicEndpointPrefix}auth/forgotpassword`, body)
    .then(([res, status]) => {
      if (status >= 400) {
        throw new Error(res.message);
      }
      return res.message;
    });
};

export const useForgotPassword = () => useMutation(forgotPassword);
