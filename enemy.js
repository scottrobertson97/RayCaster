class Enemy extends Entity {
	constructor (x, y, size, src){
		super(x, y, size, src);
	}

	update(player){
		let vecToPlayer = {x: player.x - this.x, y: player.y - this.y};
		let direction = norm(vecToPlayer);	

		let oldX = Math.trunc(this.x)>>6;
		let oldY = Math.trunc(this.y)>>6;

		this.x += direction.x*this.speed;
		this.y += direction.y*this.speed;

		let newX = Math.trunc(this.x)>>6;
		let newY = Math.trunc(this.y)>>6;
		if(map[newY][newX] > 0){
			if(newX != oldX){
				this.x -= direction.x*this.speed;
			}
			if(newY != oldY) {
				this.y -= direction.y*this.speed;
			}
		}
	}
}