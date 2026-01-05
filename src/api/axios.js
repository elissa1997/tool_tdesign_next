import axios from "axios";

export function instance_api(config) {

  const instance = axios.create({
      timeout: 8000,
      headers: { 'Content-Type':'application/json'}
  })


  instance.interceptors.request.use(config => {
      return config
  },err => {
      console.log(err);
  })

  instance.interceptors.response.use(res => {
      return res.data
  },err => {
      console.log(err);
  })


  return instance(config)
}