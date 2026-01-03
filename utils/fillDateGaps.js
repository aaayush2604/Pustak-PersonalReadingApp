export function fillDateGaps(data) {
  if (!data || data.length < 2) return data;

  const ONE_DAY = 24 * 60 * 60 * 1000;
  const filled = [];

  for (let i = 0; i < data.length - 1; i++) {
    filled.push(data[i]);

    let t = data[i].x + ONE_DAY;
    while (t < data[i + 1].x) {
      filled.push({ x: t, y: 0 });
      t += ONE_DAY;
    }
  }

  filled.push(data[data.length - 1]);
  return filled;
}
