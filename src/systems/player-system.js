export function updatePlayer(state) {
  state.world.player.update(state.runtime.dt, state.input.keyboard, state.world.map, bullet => {
    state.entities.bullets.push(bullet)
  })
}
