export function wrappedIndex(current: number, length: number, delta: -1 | 1) {
  if (length <= 0) return 0;
  return (current + delta + length) % length;
}

export function swipeDelta(dx: number, dy: number, threshold = 48): -1 | 0 | 1 {
  if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) return 0;
  return dx < 0 ? 1 : -1;
}
