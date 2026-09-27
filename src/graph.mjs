export function analyze(graph) {
  if (!graph || typeof graph !== 'object' || Array.isArray(graph)) throw new TypeError('Package graph must be an object');
  const names = Object.keys(graph).sort();
  const valid = /^[A-Za-z][A-Za-z0-9_-]*$/;
  const missing = new Set();
  for (const name of names) {
    if (!valid.test(name)) throw new Error(`Invalid package name: ${name}`);
    if (!Array.isArray(graph[name])) throw new Error(`Dependencies must be an array: ${name}`);
    const unique = new Set();
    for (const dep of graph[name]) {
      if (typeof dep !== 'string' || !valid.test(dep)) throw new Error(`Invalid package name: ${dep}`);
      if (unique.has(dep)) throw new Error(`Duplicate dependency: ${name} -> ${dep}`);
      unique.add(dep);
      if (!Object.hasOwn(graph, dep)) missing.add(dep);
    }
  }
  const color = new Map(), order = [], cycles = [], cycleKeys = new Set();
  for (const start of names) {
    if (color.has(start)) continue;
    const stack = [];
    function enter(name) {
      color.set(name, 1);
      stack.push({ name, dependencies: [...graph[name]].sort(), next: 0 });
    }
    enter(start);
    while (stack.length) {
      const frame = stack.at(-1);
      if (frame.next === frame.dependencies.length) {
        color.set(frame.name, 2);
        order.push(frame.name);
        stack.pop();
        continue;
      }
      const dep = frame.dependencies[frame.next++];
      if (!Object.hasOwn(graph, dep)) continue;
      if (!color.has(dep)) enter(dep);
      else if (color.get(dep) === 1) {
        const index = stack.findIndex(item => item.name === dep);
        const cycle = [...stack.slice(index).map(item => item.name), dep];
        const key = cycle.slice(0, -1).sort().join('|');
        if (!cycleKeys.has(key)) { cycles.push(cycle); cycleKeys.add(key); }
      }
    }
  }
  return { packages: names, missing: [...missing].sort(), cycles, install_order: cycles.length ? [] : order, edges: names.flatMap(name => graph[name].map(dep => ({ from: name, to: dep }))) };
}

export function toMermaid(report) {
  const lines = ['flowchart LR'];
  const allNames = [...new Set([...report.packages, ...report.missing])].sort();
  const idByName = new Map(allNames.map((name, index) => [name, `p${index}`]));
  for (const name of allNames) lines.push(`    ${idByName.get(name)}["${name}${report.missing.includes(name) ? ' (missing)' : ''}"]`);
  for (const edge of report.edges) lines.push(`    ${idByName.get(edge.from)} --> ${idByName.get(edge.to)}`);
  return lines.join('\n') + '\n';
}
