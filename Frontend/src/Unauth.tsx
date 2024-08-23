import axios from 'axios';

const unauthApi = axios.create({
  baseURL: '/api'
});

export default unauthApi;
