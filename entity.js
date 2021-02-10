class Entity {
	constructor (x, y, size, src){
		this.x = x;
		this.y = y;
		this.size = size;
		this.drwan = false;
		this.img = new Image();
		this.img.src = src;
		this.img.setAttribute('crossOrigin', '');
		this.speed = 0.2;
	}
	
	draw(player, ctx, map_ctx, view){
		let disT= dist(player.x, player.y, this.x, this.y);
	
		let minT = player.a - (fov/2)* (Math.PI/180);
		let maxT = player.a + (fov/2)* (Math.PI/180);
		//let wideMinT = minT - 0.3;
		//let wideMaxT = maxT + 0.3;
		let x = this.x - player.x;
		let y = this.y - player.y;
		//let length = dist(0,0,x,y);
		//x = x/length;
		//y = y/length;
		//let t = 0;
		//if(y>0 && x>0) {
		//	t = Math.atan(y/x);
		//}else if(y>0 && x<0){
		//	t = Math.atan(y/x)+Math.PI;
		//}else if(y<0 && x<0){
		//	t = Math.atan(y/x)+Math.PI;
		//}else if(y<0 && x>0){
		//	t = Math.atan(y/x)+Math.PI+Math.PI;	
		//}

		let t = Math.atan(y/x);
		if(y<0 && x>0){
			t+=Math.PI*2;
		}else if((y>0 && x<0) || (y<0 && x<0)){
			t+=Math.PI;
		}

		//if(t > Math.PI*2)
		//	t-=Math.PI*2;
		//if(t<0)
		//	t+=Math.PI*2
			
		let ca = player.a - t;

		//if(ca < 0)
		//	ca += Math.PI*2;
		//if(ca > Math.PI*2)
		//	ca -= Math.PI*2;
		disT *= Math.cos(ca);//fix fisheye	
	
		//let relativeEntityHeight = this.size/10;
		let lineH = Math.trunc((Map.size*view.height/* *relativeEntityHeight  */)/disT); //height of drawn image
		let lineO = view.halfHeight - Math.trunc(lineH/2); //offset off of y of image
		
		//#region draw lines
		if(drawMap){
			this.drawTracerLine(map_ctx, player);
			
		}
		//#endregion
	
		let width = (lineH/this.img.height) * this.size * 2/*this.img.width*/;
		let percent = (t-minT) / (maxT-minT);
		//console.log(percent);
		if(minT<0 && t > player.a+Math.PI){
			percent = (t - minT - Math.PI*2) / (maxT-minT);
		}else if(maxT > Math.PI*2 && t < player.a-Math.PI){
			percent = (t - minT + Math.PI*2) / (maxT-minT);
		}

		//f(t > maxT+0.3){
		//	console.log("");
		//	console.log("max");
		//	console.log(percent);
		//	percent = (t - minT - Math.PI*2) / (maxT-minT);
		//	console.log(percent);
		// else if(t < minT-0.3){
		//	console.log("");
		//	console.log("min");
		//	console.log(percent);
		//	percent = (t + Math.PI*2 - minT) / (maxT-minT);
		//	console.log(percent);
		//
		let CX = ((percent)*view.width) - width/2;
		ctx.drawImage(this.img, CX, lineO, width, lineH);
		//t *= (180/Math.PI);
		//minT*= (180/Math.PI);
		//maxT*= (180/Math.PI);
		//a = {t, minT, maxT};
	}	

	draw2D(ctx){
		if(drawMap){
			ctx.beginPath();
			ctx.moveTo(this.x - this.size, this.y - this.size);		
			ctx.lineTo(this.x + this.size, this.y - this.size);
			ctx.lineTo(this.x + this.size, this.y + this.size);
			ctx.lineTo(this.x - this.size, this.y + this.size);
			ctx.lineTo(this.x - this.size, this.y - this.size);
			ctx.strokeStyle = 'green';
			ctx.lineWidth = 1;
			ctx.stroke();
		}
	}

	update(player, norm){
	}

	drawTracerLine(map_ctx, player){
		map_ctx.strokeStyle = 'blue';
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
		map_ctx.strokeStyle = 'green';
		map_ctx.lineWidth = 5;
		map_ctx.stroke();
	}
}
