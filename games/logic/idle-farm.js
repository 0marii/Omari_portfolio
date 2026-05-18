/** @param {{ coins: number, rate: number, cost: number }} state */
export function tickFarm(state, dt) {
  const coins = state.coins + state.rate * dt;
  return { ...state, coins };
}

/** @param {{ coins: number, rate: number, cost: number }} state */
export function buyUpgrade(state) {
  if (state.coins < state.cost) return { ...state, bought: false };
  return {
    coins: state.coins - state.cost,
    rate: state.rate + 1,
    cost: Math.floor(state.cost * 1.5),
    bought: true,
  };
}

export function initialFarm() {
  return { coins: 0, rate: 1, cost: 10 };
}
