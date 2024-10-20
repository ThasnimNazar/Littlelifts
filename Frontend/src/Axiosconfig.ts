import axios,{ AxiosInstance } from 'axios';

const publicApi = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_BASE_URL}`,
  withCredentials: true,
});


const adminApi = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_BASE_URL}/api/admin`,
  withCredentials: true,
});

const parentApi = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_BASE_URL}/api/parent`,
  withCredentials: true,
});

const sitterApi = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_BASE_URL}/api/sitter`,
  withCredentials: true,
});



const attachResponseInterceptor = (apiInstance: AxiosInstance, loginRoute: string) => {
  apiInstance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const { response } = error;
        if (response) {
          const { status, data } = response;
          if (status === 401) {
            console.error('Unauthorized request - redirecting to login');
            window.location.href = loginRoute;
          } else if (status === 403) {
            if (data.message === 'Your account is blocked') {
              alert(data.message); 
              window.location.href = loginRoute; 
            } else {
              console.error('Forbidden request - access denied');
            }
          } else {
            console.error(`Received status code ${status}`);
          }
        } else {
          console.error('Network error or no response from server');
        }
      } else if (error instanceof Error) {
        console.error('Error message:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      return Promise.reject(error);
    }
  );
};

attachResponseInterceptor(adminApi, '/admin/login');
attachResponseInterceptor(parentApi, '/parent/parentlogin');
attachResponseInterceptor(sitterApi, '/sitter/sitterlogin');

export { publicApi, adminApi, parentApi, sitterApi };
