export const columns = 18;
export const rows = 16;
export const offsets = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] } as const;
export type Direction = keyof typeof offsets;
type Cell = { x: number; y: number };
export type Round = {
  body: Cell[];
  food: Cell | null;
  heading: Direction;
  phase: "ready" | "playing" | "paused" | "over" | "won";
};

export function newRound(): Round {
  return {
    body: [5, 4, 3, 2].map(x => ({ x, y: 8 })),
    food: { x: 10, y: 8 }, heading: "right", phase: "ready",
  };
}

export function queueTurn(queue: Direction[], heading: Direction, next: Direction) {
  const previous = queue.at(-1) ?? heading;
  // Perpendicular turns only. Keep one extra input for fast corners.
  if (queue.length < 2 && Boolean(offsets[previous][0]) !== Boolean(offsets[next][0])) queue.push(next);
}

function placeFood(body: Cell[]) {
  const occupied = new Set(body.map(cell => cell.y * columns + cell.x));
  const free: Cell[] = [];
  for (let i = 0; i < columns * rows; i++) {
    if (!occupied.has(i)) free.push({ x: i % columns, y: Math.floor(i / columns) });
  }
  return free[Math.floor(Math.random() * free.length)] ?? null;
}

export function advance(round: Round, heading: Direction): Round {
  const [dx, dy] = offsets[heading];
  const head = { x: round.body[0].x + dx, y: round.body[0].y + dy };
  const eats = head.x === round.food?.x && head.y === round.food?.y;
  const rest = eats ? round.body : round.body.slice(0, -1);
  if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows ||
      rest.some(cell => cell.x === head.x && cell.y === head.y)) {
    return { ...round, phase: "over" };
  }
  const body = [head, ...rest];
  const food = eats ? placeFood(body) : round.food;
  return { body, heading, food, phase: food ? "playing" : "won" };
}
