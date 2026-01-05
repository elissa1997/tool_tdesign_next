import * as L from 'leaflet';

export function TDTBaseLayer() {
  let img_c = L.tileLayer(getTileUrl('img_c'), {
    maxZoom: 17,
    tileSize: 256,
    zoomOffset: 1,
    subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
  })

  let cia_c = L.tileLayer(getTileUrl('cia_c'), {
    maxZoom: 17,
    tileSize: 256,
    zoomOffset: 1,
    subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
  })

  return [img_c, cia_c]
}

export function FY4AImgLayer(url, type) {
  let bounds = {
    FY4A_CHINA_LMI: [[4.701108, 60.201267],[53.805868, 138.806575]],
    FY4B_CHINA_AGRI_72H: [[4.801108, 60.796267],[53.805868, 138.806575]]
  }


  let layer = L.imageOverlay(url, bounds[type])

  return layer;
}

// 拼接瓦片地址
function getTileUrl(type) {
  return `http://{s}.tianditu.gov.cn/DataServer?T=${type}&x={x}&y={y}&l={z}&tk=${import.meta.env.VITE_APP_TDT_KEY}`
}