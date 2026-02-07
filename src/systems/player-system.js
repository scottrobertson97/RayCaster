export function updatePlayer(state) {
  state.player.update(state.dt, state.keyboard, state.map, bullet => {
    state.entityStore.bullets.push(bullet)
  })
}
