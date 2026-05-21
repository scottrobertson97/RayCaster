const walls = []
const imgSrcs = [
  '',
  'https://i.imgur.com/7B86fSv.png',
  'https://i.imgur.com/vSDbzMX.png',
]

imgSrcs.forEach((src, i) => {
  if (!src) {
    walls[i] = null
    return
  }

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = src
  walls[i] = img
})

export { walls }
