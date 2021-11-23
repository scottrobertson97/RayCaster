class Entity {
  constructor(x, y, size, src, frameRate = 0.5) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.drwan = false;
    if (Array.isArray(src)) {
      this.imgs = [];
      this.frameIndex = 0;
      this.frameRate = frameRate;
      this.frameTick = 0;
      for (const srcURL of src) {
        let img = new Image();
        img.src = srcURL;
        img.setAttribute("crossOrigin", "");
        this.imgs.push(img);
      }
    } else {
      this.img = new Image();
      this.img.src = src;
      this.img.setAttribute("crossOrigin", "");
    }
    this.speed = 0.2;
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

  draw(dt, player, ctx, map_ctx, view, _height = 1, _width = 1) {
    let disT = dist(player.x, player.y, this.x, this.y);

    let minT = player.a - (fov / 2) * (Math.PI / 180);
    let maxT = player.a + (fov / 2) * (Math.PI / 180);
    let x = this.x - player.x;
    let y = this.y - player.y;

    let t = Math.atan(y / x);
    if (y < 0 && x > 0) {
      t += Math.PI * 2;
    } else if ((y > 0 && x < 0) || (y < 0 && x < 0)) {
      t += Math.PI;
    }
    let ca = player.a - t;
    disT *= Math.cos(ca); //fix fisheye

    //let relativeEntityHeight = this.size/10;
    let lineH = Math.trunc((Map.size * view.height * _height) / disT); //height of drawn image
    //let lineO = view.halfHeight - Math.trunc(lineH/2); //offset off of y of image
    let lineO = 225 - Math.trunc(lineH / 2);
    //#region draw lines
    if (drawMap) {
      this.drawTracerLine(map_ctx, player);
    }
    //#endregion

    if (this?.img?.src == "https://i.imgur.com/xrYTZhD.png")
      console.log(this.img.height);
    let imageHeight = this.img
      ? this.img.height
      : this.imgs[this.frameIndex].height;
    let imageWidth = this.img
      ? this.img.width
      : this.imgs[this.frameIndex].width;
    let width = lineH * (imageWidth / imageHeight);
    // let width =
    //   (lineH / imageHeight) * this.size * 2 * _width; /*this.img.width*/
    let percent = (t - minT) / (maxT - minT);
    //console.log(percent);
    if (minT < 0 && t > player.a + Math.PI) {
      percent = (t - minT - Math.PI * 2) / (maxT - minT);
    } else if (maxT > Math.PI * 2 && t < player.a - Math.PI) {
      percent = (t - minT + Math.PI * 2) / (maxT - minT);
    }
    let CX = percent * view.width - width / 2;
    if (this.img) {
      ctx.drawImage(this.img, CX, lineO, width, lineH);
    } else {
      ctx.drawImage(this.imgs[this.frameIndex], CX, lineO, width, lineH);
      this.frameTick += dt;
      if (this.frameTick > this.frameRate) {
        this.frameTick = 0;
        this.frameIndex++;
        if (this.frameIndex >= this.imgs.length) this.frameIndex = 0;
      }
    }
  }

  draw2D(ctx) {
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

  update(player, norm) {}

  drawTracerLine(map_ctx, player) {
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
