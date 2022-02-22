import { prefix } from "@/utils/common";

export const signOut = (): void => {
  localStorage.removeItem(`${prefix}refreshToken`);
  sessionStorage.removeItem(`${prefix}idToken`);
};
