import { useMutation } from "react-query";
import { useSetRecoilState } from "recoil";

import { api, publicEndpointPrefix } from "@/lib/fetch";
import { signedInState } from "@/stores";
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
    .post<RefreshIdTokenResponseData, typeof body>(
      `${publicEndpointPrefix}auth/refreshidtoken`,
      body,
    )
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

export const useRefreshIdToken = () => {
  const setSignedIn = useSetRecoilState(signedInState);

  return useMutation(refreshIdToken, { onSuccess: () => setSignedIn(true) });
};
