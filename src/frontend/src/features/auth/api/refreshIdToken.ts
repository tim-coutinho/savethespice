import { useMutation } from "react-query";

import { api } from "@/lib/fetch";
import { prefix } from "@/utils/common";

interface RefreshIdTokenResponseData {
  user: string;
  idToken: string;
  idTokenExpiryTimestamp: string;
  refreshTokenExpired?: boolean;
}

const refreshIdToken = (): Promise<void> => {
  const refreshToken = localStorage.getItem(`${prefix}refreshToken`);
  if (!refreshToken) {
    localStorage.removeItem(`${prefix}refreshToken`);
    localStorage.removeItem(`${prefix}idTokenExpiryTimestamp`);
    return Promise.reject("No refresh token");
  }

  const idTokenExpiryTimestamp = Date.parse(
    localStorage.getItem(`${prefix}idTokenExpiryTimestamp`) ?? "",
  );
  if (isFinite(idTokenExpiryTimestamp) && Date.now() < idTokenExpiryTimestamp) {
    // No need to refresh
    return Promise.resolve();
  }

  const body = { refreshToken };
  return api
    .post<RefreshIdTokenResponseData, typeof body>("auth/refreshidtoken", body)
    .then(([res, status]) => {
      if (status >= 400) {
        if (res.data?.refreshTokenExpired) {
          localStorage.removeItem(`${prefix}refreshToken`);
          localStorage.removeItem(`${prefix}idTokenExpiryTimestamp`);
        }
        throw new Error(res.message);
      }
      const { idToken, idTokenExpiryTimestamp } = res.data;
      sessionStorage.setItem(`${prefix}idToken`, idToken);
      localStorage.setItem(`${prefix}idTokenExpiryTimestamp`, idTokenExpiryTimestamp);
    });
};

export const useRefreshIdToken = () => useMutation(refreshIdToken);
