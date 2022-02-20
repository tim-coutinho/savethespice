import { useMutation } from "react-query";

import { api } from "@/lib/fetch";
import { prefix } from "@/utils/common";

interface RefreshIdTokenResponseData {
  refreshTokenExpired: boolean;
  idToken: string;
  user: string;
}

const refreshIdToken = (): Promise<string> => {
  const refreshToken = localStorage.getItem(`${prefix}refreshToken`);
  if (!refreshToken) {
    return Promise.reject("No refresh token");
  }
  const body = { refreshToken };

  return api
    .post<RefreshIdTokenResponseData, typeof body>("auth/refreshidtoken", body)
    .then(([res, status]) => {
      if (status >= 400) {
        if (res.data?.refreshTokenExpired) {
          localStorage.removeItem(`${prefix}refreshToken`);
        }
        throw new Error(res.message);
      }
      const { idToken, user } = res.data;
      sessionStorage.setItem(`${prefix}idToken`, idToken);
      return user;
    });
};

export const useRefreshIdToken = () => useMutation(refreshIdToken);
