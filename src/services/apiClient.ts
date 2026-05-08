import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.jagedo.com/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config) => {
  // TODO: attach token from AsyncStorage
  // const token = await AsyncStorage.getItem("token");
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // TODO: handle logout / token refresh
    }
    return Promise.reject(err);
  }
);
