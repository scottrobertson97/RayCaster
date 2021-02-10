class Bullet extends Entity {
	constructor (x, y, size, src){
		let direction = norm({x:player.dx, y: player.dy});	
		super(x+(direction.x*20), y+(direction.y*20), size, src);
		this.speed = 5;		
		this.direction = direction;
	}

	update(player, norm){
		let oldX = Math.trunc(this.x)>>6;
		let oldY = Math.trunc(this.y)>>6;

		this.x += this.direction.x*this.speed;
		this.y += this.direction.y*this.speed;

		let newX = Math.trunc(this.x)>>6;
		let newY = Math.trunc(this.y)>>6;
		if(map[newY][newX] > 0){
			entities = entities.filter(e => e != this);
		}
	}

	draw(player, ctx, map_ctx, view){
		super.draw(player, ctx, map_ctx, view, 0.4, 6);
	}
}