import { useMutation } from "@tanstack/react-query";
import { signInApi, SIGN_IN_API_PATH } from "@/api/auth/v1/login";
import type { ClientType, SignInRequest } from "@/api/auth/types";

interface UseSignInMutationParams {
  data: SignInRequest;
  clientType: ClientType;
}

const useSignIn = () => {
  return useMutation({
    mutationKey: [SIGN_IN_API_PATH],
    mutationFn: ({ data, clientType }: UseSignInMutationParams) =>
      signInApi(data, clientType),
  });
};

export default useSignIn;
