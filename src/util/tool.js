const imgModules = import.meta.glob('@/assets/img/*', {
  eager: true,
  import: 'default'
})

// 获取 assets/img 下的图片
export function getAssetsImg(url) {
  return imgModules[`/src/assets/img/${url}`]
}
