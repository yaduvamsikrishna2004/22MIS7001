import axios from 'axios';

import { runtimeConfig } from '../config/runtime-config';

export const axiosClient = axios.create({
  baseURL: runtimeConfig.apiBaseUrl,
  timeout: runtimeConfig.requestTimeoutMs,
  headers: {
    'Content-Type': 'application/json'
  }
});
