import { useMutation } from "@tanstack/react-query";
import { signUpApi } from "@/api/auth/signUp";
import type { SignUpRequest } from "@/api/auth/types";

export const useSignUp = () => {
  return useMutation({
    mutationFn: (data: SignUpRequest) => signUpApi(data),
  });
};
