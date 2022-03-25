import { useMutation } from "react-query";

import { AuthService } from "@/lib/fetch";

const forgotPassword = (email: string): Promise<string> =>
  AuthService.forgotPassword({ email }).then(res => res.message);

export const useForgotPassword = () => useMutation(forgotPassword);
