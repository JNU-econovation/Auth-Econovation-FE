import { useMutation } from "@tanstack/react-query";
import { signUpApi, SIGN_UP_API_PATH } from "@/api/auth/signUp";
import type { SignUpRequest } from "@/api/auth/types";

interface UseSignUpProps {
  code?: string;
}

const useSignUp = ({ code }: UseSignUpProps = {}) => {
  return useMutation({
    mutationKey: [SIGN_UP_API_PATH, code],
    mutationFn: (data: SignUpRequest) => signUpApi(data, code),
  });
};

export default useSignUp;
