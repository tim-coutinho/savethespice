import { endpoint } from "../utils/secrets";
import { prefix } from "../utils/common";
// import { jwtDecrypt } from "jose/jwt/decrypt";

export const login = (setUser, email, password) => {
  const refreshToken = localStorage.getItem(`${prefix}refreshToken`);
  const body = JSON.stringify(refreshToken ? { refreshToken } : { email, password });

  fetch(`${endpoint}/auth?operation=SIGN_IN`, {
    method: "POST",
    body,
  })
    .then(res => res.json())
    .then(res => {
      if (res.error) {
        if (res.data?.refresh_token_expired) {
          return; // User must sign in manually
        }
        throw new Error(res.message);
      }
      const { idToken, refreshToken, user: Username } = res.data;
      refreshToken && localStorage.setItem(`${prefix}refreshToken`, refreshToken);
      sessionStorage.setItem(`${prefix}idToken`, idToken);
      setUser(Username);
    })
    .catch(error => console.log(`CORS probably fucked: ${error}`));
};

export const signOut = setUser => {
  setUser(null);
  localStorage.removeItem(`${prefix}refreshToken`);
};
