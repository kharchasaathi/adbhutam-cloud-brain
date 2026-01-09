const memory = [];

export function addToMemory(role, content) {
  memory.push({ role, content });

  // Keep last 6 turns only
  if (memory.length > 12) memory.shift();
}

export function getMemory() {
  return memory;
}
