import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export const apiClient = axios.create({ baseURL });
