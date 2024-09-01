import axios,{ AxiosInstance } from 'axios';

const publicApi = axios.create({
  baseURL: 'http://localhost:5003',
  withCredentials: true,
});

const adminApi = axios.create({
  baseURL: 'http://localhost:5003/api/admin',
  withCredentials: true,
});

const parentApi = axios.create({
  baseURL: 'http://localhost:5003/api/parent',
  withCredentials: true,
});

const sitterApi = axios.create({
  baseURL: 'http://localhost:5003/api/sitter',
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
