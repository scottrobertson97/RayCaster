import { dist, norm } from "./helper";
import { GameMap } from "./map";

export interface PlayerLike {
  x: number;
  y: number;
  a: number;
}

interface EntityDrawOptions {
  fov?: number;
  drawMap?: boolean;
  height?: number;
  scale?: number;
}

interface Viewport {
  width: number;
  height: number;
  halfHeight: number;
}

export class Entity {
  x: number;
  y: number;
  size: number;
  drawn: boolean = false;
  speed: number = 0.2;
  img?: HTMLImageElement;
  imgs?: HTMLImageElement[];
  imgRatio?: number;
  imgRatios?: number[];
  frameIndex: number = 0;
  frameRate: number;
  frameTick: number = 0;

  constructor(
    x: number,
    y: number,
    size: number,
    src: string | string[],
    frameRate = 0.5
  ) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.frameRate = frameRate;
    if (Array.isArray(src)) {
      this.imgs = [];
      this.imgRatios = [];
      for (const srcURL of src) {
        const img = new Image();
        img.onload = () => {
          this.imgRatios?.push(img.width / img.height);
        };
        img.src = srcURL;
        img.setAttribute("crossOrigin", "");
        this.imgs.push(img);
      }
    } else {
      this.img = new Image();
      this.img.onload = () => {
        this.imgRatio = this.img?.width! / this.img?.height!;
      };
      this.img.src = src;
      this.img.setAttribute("crossOrigin", "");
    }
  }

  get max() {
    return { x: this.x + this.size, y: this.y + this.size };
  }
  get min() {
    return { x: this.x - this.size, y: this.y - this.size };
  }
  get point() {
    return { x: this.x, y: this.y };
  }

  draw(
    dt: number,
    player: PlayerLike,
    ctx: CanvasRenderingContext2D,
    map_ctx: CanvasRenderingContext2D,
    view: Viewport,
    { fov = 90, drawMap = false, height = 1 }: EntityDrawOptions = {}
  ) {
    if (!this.imgRatio && this.img) {
      this.imgRatio = this.img.width / this.img.height;
    }

    const disT = dist(player.x, player.y, this.x, this.y);
    const minT = player.a - (fov / 2) * (Math.PI / 180);
    const maxT = player.a + (fov / 2) * (Math.PI / 180);
    const x = this.x - player.x;
    const y = this.y - player.y;

    let t = Math.atan(y / x);
    if (y < 0 && x > 0) {
      t += Math.PI * 2;
    } else if ((y > 0 && x < 0) || (y < 0 && x < 0)) {
      t += Math.PI;
    }
    const ca = player.a - t;
    const correctedDistance = disT * Math.cos(ca);

    const lineH = Math.trunc((GameMap.size * view.height * height) / correctedDistance);
    const lineO = view.halfHeight * 0.75 - Math.trunc(lineH / 2);

    if (drawMap) {
      this.drawTracerLine(map_ctx, player);
    }

    const _imgRatio = this.img ? this.imgRatio ?? 1 : this.imgRatios?.[this.frameIndex] ?? 1;
    const width = lineH * _imgRatio;
    let percent = (t - minT) / (maxT - minT);
    if (minT < 0 && t > player.a + Math.PI) {
      percent = (t - minT - Math.PI * 2) / (maxT - minT);
    } else if (maxT > Math.PI * 2 && t < player.a - Math.PI) {
      percent = (t - minT + Math.PI * 2) / (maxT - minT);
    }
    const CX = percent * view.width - width / 2;

    if (this.img) {
      ctx.drawImage(this.img, CX, lineO, width, lineH);
    } else if (this.imgs) {
      ctx.drawImage(this.imgs[this.frameIndex], CX, lineO, width, lineH);
      this.frameTick += dt;
      if (this.frameTick > this.frameRate) {
        this.frameTick = 0;
        this.frameIndex++;
        if (this.frameIndex >= this.imgs.length) this.frameIndex = 0;
      }
    }
  }

  draw2D(ctx: CanvasRenderingContext2D, drawMap = false) {
    if (drawMap) {
      ctx.beginPath();
      ctx.moveTo(this.x - this.size, this.y - this.size);
      ctx.lineTo(this.x + this.size, this.y - this.size);
      ctx.lineTo(this.x + this.size, this.y + this.size);
      ctx.lineTo(this.x - this.size, this.y + this.size);
      ctx.lineTo(this.x - this.size, this.y - this.size);
      ctx.strokeStyle = "green";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  update(player: PlayerLike, normFn: typeof norm, map: GameMap): void {}

  drawTracerLine(map_ctx: CanvasRenderingContext2D, player: PlayerLike) {
    map_ctx.strokeStyle = "blue";
    map_ctx.lineWidth = 5;
    map_ctx.beginPath();
    map_ctx.moveTo(this.x + this.size, this.y - this.size);
    map_ctx.lineTo(this.x - this.size, this.y + this.size);
    map_ctx.stroke();
    map_ctx.beginPath();
    map_ctx.moveTo(this.x - this.size, this.y - this.size);
    map_ctx.lineTo(this.x + this.size, this.y + this.size);
    map_ctx.stroke();
    map_ctx.beginPath();
    map_ctx.moveTo(player.x, player.y);
    map_ctx.lineTo(this.x, this.y);
    map_ctx.strokeStyle = "green";
    map_ctx.lineWidth = 5;
    map_ctx.stroke();
  }
}
