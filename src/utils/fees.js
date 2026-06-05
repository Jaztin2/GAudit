export const DEFAULT_FEE_TIERS = [
  { min: 1,   max: 199,  fee: 5  },
  { min: 200, max: 499,  fee: 10 },
  { min: 500, max: 900,  fee: 15 },
  { min: 901, max: 1009, fee: 20 },
]

export function getFee(amount, tiers = DEFAULT_FEE_TIERS) {
  const sorted = [...tiers].sort((a, b) => a.min - b.min)
  const tier = sorted.find(t => amount >= t.min && amount <= t.max)
  return tier ? tier.fee : null
}
