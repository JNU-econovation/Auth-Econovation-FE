export type ActiveStatus = "am" | "cm" | "rm" | "ob";

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

export interface ApiErrorResponse {
  status: number;
  message: string;
  code: number;
}
