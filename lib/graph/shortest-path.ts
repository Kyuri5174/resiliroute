import type { EdgeId, Network, NetworkEdge, NodeId, PathResult } from "@/types/network";

export interface RoutingGraph {
  nodeIds: Set<NodeId>;
  adjacency: Map<NodeId, { neighbor: NodeId; edge: NetworkEdge }[]>;
}
export type WeightFunction = (edge: NetworkEdge) => number;

export function buildGraph(network: Network, closedEdgeIds: readonly EdgeId[] = []): RoutingGraph {
  const closed = new Set(closedEdgeIds);
  const nodeIds = new Set(network.nodes.map((n) => n.id));
  const adjacency: RoutingGraph["adjacency"] = new Map([...nodeIds].map((id) => [id, []]));
  for (const edge of network.edges) {
    if (
      !edge.available ||
      closed.has(edge.id) ||
      !nodeIds.has(edge.source) ||
      !nodeIds.has(edge.target)
    )
      continue;
    adjacency.get(edge.source)!.push({ neighbor: edge.target, edge });
    if (edge.bidirectional) adjacency.get(edge.target)!.push({ neighbor: edge.source, edge });
  }
  return { nodeIds, adjacency };
}

// O(V² + E), a deliberate small-graph implementation with deterministic ties.
// A compiled graph can be reused across OD assignments and service calculations.
export function shortestPath(
  graph: RoutingGraph,
  start: NodeId,
  goal: NodeId,
  weightFunction: WeightFunction = (edge) => edge.freeFlowTime,
): PathResult {
  const unreachable: PathResult = {
    reachable: false,
    nodeIds: [],
    edgeIds: [],
    travelTime: Infinity,
    distance: 0,
  };
  if (!graph.nodeIds.has(start) || !graph.nodeIds.has(goal)) return unreachable;
  if (start === goal)
    return { reachable: true, nodeIds: [start], edgeIds: [], travelTime: 0, distance: 0 };
  const pending = new Set(graph.nodeIds);
  const distance = new Map<NodeId, number>([[start, 0]]);
  const previous = new Map<NodeId, { node: NodeId; edge: NetworkEdge }>();
  while (pending.size) {
    let current: NodeId | undefined;
    let best = Infinity;
    for (const id of pending) {
      const candidate = distance.get(id) ?? Infinity;
      if (candidate < best) {
        best = candidate;
        current = id;
      }
    }
    if (current === undefined) break;
    pending.delete(current);
    if (current === goal) break;
    for (const { neighbor, edge } of graph.adjacency.get(current) ?? []) {
      if (!pending.has(neighbor)) continue;
      const weight = weightFunction(edge);
      if (weight < 0) throw new Error("Dijkstra requires nonnegative travel costs.");
      if (!Number.isFinite(weight)) continue;
      const nextDistance = best + weight;
      if (nextDistance < (distance.get(neighbor) ?? Infinity)) {
        distance.set(neighbor, nextDistance);
        previous.set(neighbor, { node: current, edge });
      }
    }
  }
  if (!previous.has(goal)) return unreachable;
  const nodeIds = [goal];
  const edgeIds: EdgeId[] = [];
  let totalDistance = 0;
  let cursor = goal;
  while (cursor !== start) {
    const step = previous.get(cursor)!;
    nodeIds.unshift(step.node);
    edgeIds.unshift(step.edge.id);
    totalDistance += step.edge.distance;
    cursor = step.node;
  }
  return {
    reachable: true,
    nodeIds,
    edgeIds,
    travelTime: distance.get(goal)!,
    distance: totalDistance,
  };
}
