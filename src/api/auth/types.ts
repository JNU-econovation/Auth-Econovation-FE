export type ActiveStatus = "am" | "cm" | "rm" | "ob";

export type ClientType = "web" | "mobile";

export interface SignUpRequest {
  name: string;
  id: string;
  password: string;
  generation: number;
  activeStatus: ActiveStatus;
}

export interface SignUpResponse {
  accessToken: string;
}

export interface SignInRequest {
  id: string;
  password: string;
}

export interface SignInResponse {
  data: {
    accessToken: string;
    accessExpiredTime: number;
    refreshToken?: string;
  };
  message: string;
  code: string;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  code: number;
}
