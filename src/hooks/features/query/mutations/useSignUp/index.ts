import { useMutation } from "@tanstack/react-query";
import { signUpApi, SIGN_UP_API_PATH } from "@/api/auth/signUp";
import type { SignUpRequest } from "@/api/auth/types";

const useSignUp = () => {
  return useMutation({
    mutationKey: [SIGN_UP_API_PATH],
    mutationFn: (data: SignUpRequest) => signUpApi(data),
  });
};

export default useSignUp;
