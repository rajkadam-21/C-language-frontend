
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;
console.log(API_BASE_URL)
export const compileCode = (code: string, input: string) => {
  
  return axios.post(`${API_BASE_URL}/api/compile`, { code, input });
};