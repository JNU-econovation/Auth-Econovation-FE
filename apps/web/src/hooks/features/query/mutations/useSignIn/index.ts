import { useMutation } from "@tanstack/react-query";
import {
  signInApi,
  SIGN_IN_API_PATH,
  type ClientType,
  type SignInRequest,
} from "@auth-econovation/api";

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
