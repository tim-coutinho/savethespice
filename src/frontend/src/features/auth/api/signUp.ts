import { useMutation } from "react-query";

import { AuthService } from "@/lib/fetch";

type SignUpOptions = { email: string; password: string };

const signUp = (body: SignUpOptions): Promise<string> =>
  AuthService.signUp(body).then(res => res.message);

export const useSignUp = () => useMutation(signUp);
