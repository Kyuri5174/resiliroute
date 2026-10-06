import { modelConfig } from "@/data/harbor-city";
import { buildGraph, shortestPath } from "@/lib/graph/shortest-path";
import { calculateCongestedTravelTime } from "./congestion";
import type { AssignedOD, EdgeId, EdgeState, Network, ODPair, PathResult } from "@/types/network";

export function calculateEdgeVolumes(
  network: Network,
  assignments: readonly { od: ODPair; path: PathResult }[],
): Record<EdgeId, number> {
  const volumes = Object.fromEntries(network.edges.map((e) => [e.id, 0]));
  for (const { od, path } of assignments) {
    if (!path.reachable) continue;
    for (const id of path.edgeIds) volumes[id] += od.demand;
  }
  return volumes;
}

// Method of successive averages: each iteration assigns the same demand to
// current least-cost paths, then averages the route flows. No demand vanishes
// unless its destination is disconnected; those trips remain in the metrics.
// This is a fixed-iteration educational approximation, not a calibrated equilibrium.
export function calculateODAssignment(
  network: Network,
  odPairs: readonly ODPair[],
  closedEdgeIds: readonly EdgeId[] = [],
  iterations = modelConfig.assignmentIterations,
): { edgeStates: Record<EdgeId, EdgeState>; assignments: AssignedOD[]; iterations: number } {
  const graph = buildGraph(network, closedEdgeIds);
  const closed = new Set(closedEdgeIds);
  const routesByOD = odPairs.map(() => new Map<string, { path: PathResult; count: number }>());
  let volumes: Record<EdgeId, number> = Object.fromEntries(network.edges.map((e) => [e.id, 0]));
  let times = Object.fromEntries(network.edges.map((e) => [e.id, e.freeFlowTime]));
  const count = Math.max(1, Math.floor(iterations));
  for (let i = 0; i < count; i++) {
    const assignment = odPairs.map((od, index) => {
      const path = shortestPath(graph, od.origin, od.destination, (edge) => times[edge.id]);
      if (path.reachable) {
        const key = path.edgeIds.join("|");
        const entry = routesByOD[index].get(key);
        if (entry) entry.count++;
        else routesByOD[index].set(key, { path, count: 1 });
      }
      return { od, path };
    });
    const nextVolumes = calculateEdgeVolumes(network, assignment);
    const step = 1 / (i + 1);
    volumes = Object.fromEntries(
      network.edges.map((e) => [e.id, volumes[e.id] * (1 - step) + nextVolumes[e.id] * step]),
    );
    times = Object.fromEntries(
      network.edges.map((e) => [
        e.id,
        calculateCongestedTravelTime(e.freeFlowTime, volumes[e.id], e.capacity),
      ]),
    );
  }
  const edgeStates: Record<EdgeId, EdgeState> = Object.fromEntries(
    network.edges.map((edge) => [
      edge.id,
      {
        id: edge.id,
        available: edge.available && !closed.has(edge.id),
        volume: volumes[edge.id],
        utilization: volumes[edge.id] / edge.capacity,
        travelTime: times[edge.id],
      },
    ]),
  );
  const assignments: AssignedOD[] = odPairs.map((od, index) => ({
    od,
    path: shortestPath(graph, od.origin, od.destination, (edge) => times[edge.id]),
    flowPaths: [...routesByOD[index].values()].map(({ path, count: routeCount }) => ({
      path: { ...path, travelTime: path.edgeIds.reduce((sum, id) => sum + times[id], 0) },
      volume: (od.demand * routeCount) / count,
    })),
  }));
  return { edgeStates, assignments, iterations: count };
}
