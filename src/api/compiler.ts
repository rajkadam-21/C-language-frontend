import axios from 'axios';

// Use a default value if the environment variable is not set
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


console.log(API_URL)
export const compileCode = async (code: string, input: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/compile`, {
      code, 
      input
    });
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};