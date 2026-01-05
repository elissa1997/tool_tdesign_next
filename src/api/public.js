import { instance_api } from '@/api/axios.js';

export function staticFile(path) {
  return instance_api({
    url: import.meta.env.VITE_APP_CDN_API + path,
    method: 'get',
  })
}