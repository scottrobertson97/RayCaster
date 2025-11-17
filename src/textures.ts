const walls: Array<HTMLImageElement | undefined> = [];
const imgSrcs = [
  "",
  "https://i.imgur.com/7B86fSv.png",
  "https://i.imgur.com/vSDbzMX.png",
];

imgSrcs.forEach((src, i) => {
  const img = new Image();
  img.src = src;
  img.setAttribute("crossOrigin", "");
  walls[i] = img;
});

export { walls };
