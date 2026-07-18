export function paymentAmountMatches(grossAmount: unknown, expected: number) {
  const gross = Number(grossAmount);
  return Number.isFinite(gross) && gross === expected;
}

export function isValidPayoutAmount(amount: number) {
  return Number.isInteger(amount) && amount > 0;
}
