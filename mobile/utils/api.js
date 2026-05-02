import axios from 'axios';
import { getToken, saveToken, removeToken } from './storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const getAuthHeader = async () => {
  const token = await getToken('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchData = async (url) => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${BASE_URL}${url}`, { headers });
  return res.data;
};

export const postData = async (url, data) => {
  const headers = await getAuthHeader();
  const res = await axios.post(`${BASE_URL}${url}`, data, { headers });
  return res.data;
};

export const editData = async (url, data) => {
  const headers = await getAuthHeader();
  const res = await axios.put(`${BASE_URL}${url}`, data, { headers });
  return res.data;
};

export const deleteData = async (url) => {
  const headers = await getAuthHeader();
  const res = await axios.delete(`${BASE_URL}${url}`, { headers });
  return res.data;
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = await getToken('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');
    const res = await axios.post(`${BASE_URL}/api/user/refresh-token`, { refreshToken });
    if (res.data?.accesstoken) {
      await saveToken('accessToken', res.data.accesstoken);
      return res.data.accesstoken;
    }
    throw new Error('Refresh failed');
  } catch {
    await removeToken('accessToken');
    await removeToken('refreshToken');
    return null;
  }
};

export { BASE_URL };
