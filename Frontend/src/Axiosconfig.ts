import axios from 'axios';

const api = axios.create();

api.interceptors.request.use(
  (config) => {
    const role = localStorage.getItem('role'); 
    let token: string | null = '';

    if (role === 'admin') {
      config.baseURL = '/api/admin';
      token = localStorage.getItem('adminToken');
    } else if (role === 'parent') {
      config.baseURL = '/api/parent';
      token = localStorage.getItem('parentToken');
    } else if (role === 'sitter') {
      config.baseURL = '/api/sitter';
      token = localStorage.getItem('sitterToken');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response) {
//       const { status } = error.response;
//       if (status === 401) {
//         console.error('Unauthorized request - redirecting to login');
//         window.location.href = '/login';
//       } else if (status === 403) {
//         console.error('Forbidden request - access denied');
//       }
//     } else {
//       console.error('Network error or other issue');
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
