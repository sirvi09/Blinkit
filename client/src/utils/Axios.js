import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi.js";

const Axios = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// Axios interceptor for handling 401 Unauthorized responses and refreshing the token automatically via HTTP-only cookies
Axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    let originRequest = error.config;
    
    // If the request fails with 401 and we haven't already retried it
    if (error.response?.status === 401 && !originRequest.retry) {
      originRequest.retry = true;

      try {
        // Attempt to hit the refresh token endpoint.
        // It uses HTTP-only cookies to validate the refresh token and sets a new access token cookie
        const newAccessToken = await refreshAccessToken();
        
        if (newAccessToken) {
           return Axios(originRequest);
        }
      } catch (err) {
         return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

const refreshAccessToken = async () => {
  try {
    const response = await Axios({
      ...SummaryApi.refreshToken,
    });
    return response.data?.data?.accessToken;
  } catch (error) {
    console.error("Token refresh failed", error);
    return null;
  }
};

export default Axios;
