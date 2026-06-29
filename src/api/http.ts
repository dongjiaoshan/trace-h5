/**
 * 极简 HTTP 客户端：公开追溯接口免登，不注入 token / 不做加密。
 * 单实例复用，baseURL 来自 VITE_SERVER_BASEURL。
 */
import axios, { type AxiosInstance } from 'axios';

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_BASEURL,
  timeout: 15000
});

export default http;
