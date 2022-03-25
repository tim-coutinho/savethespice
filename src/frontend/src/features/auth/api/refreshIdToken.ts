import { useMutation } from "react-query";
import { useSetRecoilState } from "recoil";

import { ApiError, AuthService, RefreshIdTokenResponse } from "@/lib/fetch";
import { signedInState } from "@/stores";
import { prefix } from "@/utils/common";

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

  return AuthService.refreshIdToken({ refreshToken })
    .then(res => {
      if (!res.data) {
        return;
      }
      const { idToken, idTokenExpiryTimestamp } = res.data;
      sessionStorage.setItem(`${prefix}idToken`, idToken);
      localStorage.setItem(`${prefix}idTokenExpiryTimestamp`, idTokenExpiryTimestamp);
    })
    .catch((e: ApiError<RefreshIdTokenResponse>) => {
      if (e.body.data?.refreshTokenExpired) {
        localStorage.removeItem(`${prefix}refreshToken`);
        localStorage.removeItem(`${prefix}idTokenExpiryTimestamp`);
      }
    });
};

export const useRefreshIdToken = () => {
  const setSignedIn = useSetRecoilState(signedInState);

  return useMutation(refreshIdToken, { onSuccess: () => setSignedIn(true) });
};
