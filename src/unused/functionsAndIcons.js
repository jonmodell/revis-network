export const getShape = () => {
  const shapes = [
    { shape: 'square', type: 'Device', image: 'device' },
    { shape: 'circle', type: 'unknown' },
    { shape: 'diamond', type: 'TopoElement', image: 'topoElement' },
    { shape: 'diamond', type: 'AppComp', image: 'appComp' },
    { shape: 'hexagon', type: 'BusinessService', image: 'harProvider' },
    { shape: 'hexagon', type: 'ITService', image: 'harProvider' },
    { shape: 'hexagon', type: 'DeviceService', image: 'harProvider' },
  ];
  const rand = Math.floor(Math.random() * shapes.length);
  return shapes[rand];
};

const img1 = new Image();
img1.src =
  'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2ZXJzaW9uPSIxLjAiIGlkPSJhZ2VudCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSIxMXB4IiBoZWlnaHQ9IjExcHgiIHZpZXdCb3g9IjAgMCAxMSAxMSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTEgMTE7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+DQoJLnN0MHtmaWxsOm5vbmU7c3Ryb2tlOiM5OTk5OTk7c3Ryb2tlLW1pdGVybGltaXQ6MTA7fQ0KCS5zdDF7ZmlsbDojOTk5OTk5O30NCjwvc3R5bGU+DQo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNOSwxMC41SDJjLTAuMywwLTAuNS0wLjItMC41LTAuNVYxYzAtMC4zLDAuMi0wLjUsMC41LTAuNWg3YzAuMywwLDAuNSwwLjIsMC41LDAuNXY5QzkuNSwxMC4zLDkuMywxMC41LDksMTAuNQ0KCXoiLz4NCjxwb2x5bGluZSBjbGFzcz0ic3QwIiBwb2ludHM9IjMuNSwwLjUgMy41LDcgNC41LDguNSA0LjUsMTAuNSAiLz4NCjxwb2x5bGluZSBjbGFzcz0ic3QwIiBwb2ludHM9IjcuNSwwLjUgNy41LDcgNi41LDguNSA2LjUsMTAuNSAiLz4NCjxyZWN0IHg9IjUiIHk9IjIiIGNsYXNzPSJzdDEiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz4NCjxyZWN0IHg9IjUiIHk9IjQiIGNsYXNzPSJzdDEiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz4NCjxyZWN0IHg9IjUiIHk9IjYiIGNsYXNzPSJzdDEiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz4NCjwvc3ZnPg==';

const img2 = new Image();
img2.src =
  'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2ZXJzaW9uPSIxLjAiIGlkPSJwcm9jZXNzIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgd2lkdGg9IjExcHgiIGhlaWdodD0iMTFweCIgdmlld0JveD0iMCAwIDExIDExIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMSAxMTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4NCgkuc3Qwe2ZpbGw6bm9uZTtzdHJva2U6Izk5OTk5OTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9DQo8L3N0eWxlPg0KPGc+DQoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTEwLjUsOWMwLDAuMy0wLjIsMC41LTAuNSwwLjVIMUMwLjcsOS41LDAuNSw5LjMsMC41LDlsMC03YzAtMC4zLDAuMi0wLjUsMC41LTAuNWg5YzAuMywwLDAuNSwwLjIsMC41LDAuNVY5eg0KCQkiLz4NCjwvZz4NCjxsaW5lIGNsYXNzPSJzdDAiIHgxPSIwLjUiIHkxPSIzLjUiIHgyPSIxMC41IiB5Mj0iMy41Ii8+DQo8bGluZSBjbGFzcz0ic3QwIiB4MT0iMi41IiB5MT0iNS41IiB4Mj0iMy41IiB5Mj0iNS41Ii8+DQo8bGluZSBjbGFzcz0ic3QwIiB4MT0iNS41IiB5MT0iNS41IiB4Mj0iOC41IiB5Mj0iNS41Ii8+DQo8bGluZSBjbGFzcz0ic3QwIiB4MT0iMi41IiB5MT0iNy41IiB4Mj0iNC41IiB5Mj0iNy41Ii8+DQo8bGluZSBjbGFzcz0ic3QwIiB4MT0iNi41IiB5MT0iNy41IiB4Mj0iNy41IiB5Mj0iNy41Ii8+DQo8L3N2Zz4=';

const img3 = new Image();
img3.src =
  'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2ZXJzaW9uPSIxLjAiIGlkPSJ0b3BvbG9neSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSIxMXB4IiBoZWlnaHQ9IjExcHgiIHZpZXdCb3g9IjAgMCAxMSAxMSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTEgMTE7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+DQoJLnN0MHtmaWxsOm5vbmU7c3Ryb2tlOiM5OTk5OTk7c3Ryb2tlLW1pdGVybGltaXQ6MTA7fQ0KPC9zdHlsZT4NCjxjaXJjbGUgY2xhc3M9InN0MCIgY3g9IjUuNSIgY3k9IjUuNSIgcj0iMS45Ii8+DQo8Zz4NCgk8Y2lyY2xlIGNsYXNzPSJzdDAiIGN4PSI1LjUiIGN5PSIxLjQiIHI9IjAuOSIvPg0KCTxjaXJjbGUgY2xhc3M9InN0MCIgY3g9IjUuNSIgY3k9IjkuNiIgcj0iMC45Ii8+DQoJPGxpbmUgY2xhc3M9InN0MCIgeDE9IjUuNSIgeTE9IjIuMyIgeDI9IjUuNSIgeTI9IjMuNiIvPg0KCTxsaW5lIGNsYXNzPSJzdDAiIHgxPSI1LjUiIHkxPSI3LjQiIHgyPSI1LjUiIHkyPSI4LjciLz4NCjwvZz4NCjxnPg0KCTxlbGxpcHNlIHRyYW5zZm9ybT0ibWF0cml4KDAuNSAtMC44NjYgMC44NjYgMC41IC0yLjAxMzEgMy40NTA2KSIgY2xhc3M9InN0MCIgY3g9IjIiIGN5PSIzLjUiIHJ4PSIwLjkiIHJ5PSIwLjkiLz4NCgk8ZWxsaXBzZSB0cmFuc2Zvcm09Im1hdHJpeCgwLjUgLTAuODY2IDAuODY2IDAuNSAtMi4wMTMxIDExLjU3NTYpIiBjbGFzcz0ic3QwIiBjeD0iOSIgY3k9IjcuNSIgcng9IjAuOSIgcnk9IjAuOSIvPg0KCTxsaW5lIGNsYXNzPSJzdDAiIHgxPSIyLjciIHkxPSIzLjkiIHgyPSIzLjkiIHkyPSI0LjYiLz4NCgk8bGluZSBjbGFzcz0ic3QwIiB4MT0iNy4xIiB5MT0iNi40IiB4Mj0iOC4zIiB5Mj0iNy4xIi8+DQo8L2c+DQo8Zz4NCgk8ZWxsaXBzZSB0cmFuc2Zvcm09Im1hdHJpeCgwLjg2NiAtMC41IDAuNSAwLjg2NiAtMy41MDAxIDEuOTk5OSkiIGNsYXNzPSJzdDAiIGN4PSIyIiBjeT0iNy41IiByeD0iMC45IiByeT0iMC45Ii8+DQoJPGVsbGlwc2UgdHJhbnNmb3JtPSJtYXRyaXgoMC44NjYgLTAuNSAwLjUgMC44NjYgLTAuNTI2MiA0Ljk3MzgpIiBjbGFzcz0ic3QwIiBjeD0iOSIgY3k9IjMuNSIgcng9IjAuOSIgcnk9IjAuOSIvPg0KCTxsaW5lIGNsYXNzPSJzdDAiIHgxPSIyLjciIHkxPSI3LjEiIHgyPSIzLjkiIHkyPSI2LjQiLz4NCgk8bGluZSBjbGFzcz0ic3QwIiB4MT0iNy4xIiB5MT0iNC42IiB4Mj0iOC4zIiB5Mj0iMy45Ii8+DQo8L2c+DQo8L3N2Zz4=';

const img4 = new Image();
img4.src =
  'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2ZXJzaW9uPSIxLjAiIGlkPSJhZ2VudCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSIxMXB4IiBoZWlnaHQ9IjExcHgiIHZpZXdCb3g9IjAgMCAxMSAxMSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTEgMTE7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+DQoJLnN0MHtmaWxsOm5vbmU7c3Ryb2tlOiM5OTk5OTk7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MTA7fQ0KCS5zdDF7ZmlsbDpub25lO3N0cm9rZTojOTk5OTk5O3N0cm9rZS1taXRlcmxpbWl0OjEwO30NCjwvc3R5bGU+DQo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNOS4zLDJDOC4zLDEuMSw3LDAuNSw1LjUsMC41QzQsMC41LDIuNywxLjEsMS43LDIiLz4NCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik03LjMsM0M2LjgsMi43LDYuMiwyLjUsNS41LDIuNUM0LjgsMi41LDQuMiwyLjcsMy43LDMiLz4NCjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik04LjUsNy41YzAtMS43LTEuNC0zLjEtMy4yLTNDMy43LDQuNiwyLjUsNiwyLjUsNy43bDAsMi4zYzAsMC4zLDAuMiwwLjUsMC41LDAuNWg1YzAuMywwLDAuNS0wLjIsMC41LTAuNVY3LjV6DQoJIi8+DQo8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMi41LDkuNUgxQzAuNyw5LjUsMC41LDkuMywwLjUsOVY4YzAsMCwwLTEuNSwyLTEuNSIvPg0KPHBhdGggY2xhc3M9InN0MSIgZD0iTTguNSw5LjVIMTBjMC4zLDAsMC41LTAuMiwwLjUtMC41VjhjMCwwLDAtMS41LTItMS41Ii8+DQo8Y2lyY2xlIGNsYXNzPSJzdDEiIGN4PSI1LjUiIGN5PSI3LjUiIHI9IjEiLz4NCjwvc3ZnPg==';

export const iconMap = {
  device: img1,
  appComp: img2,
  topoElement: img3,
  harProvider: img4,
};

export const shapeData = [
  {
    id: 'back1',
    x: 0,
    y: 0,
    size: 100,
    shape: 'rectangle',
    style: { fill: '#ee4455', line: '#33ee33', lineWidth: 1 },
  },
  {
    id: 'back2',
    x: -500,
    y: 0,
    width: 200,
    height: 100,
    shape: 'cloud',
    style: { fill: '#ee4455', line: '#33ee33', lineWidth: 1 },
  },
  {
    id: 'back3',
    x: -200,
    y: 200,
    size: 100,
    shape: 'polygon',
    faces: 10,
    style: { fill: '#cc8811', line: '#33ee33', lineWidth: 1 },
  },
  {
    id: 'back4',
    x: -200,
    y: 0,
    size: 100,
    shape: 'circle',
    style: { fill: '#5544ee', line: '#222222', lineWidth: 2 },
  },
  {
    id: 'b5',
    x: 600,
    y: 0,
    height: 40,
    width: 400,
    shape: 'text',
    text:
      '“If you’re not making a mistake, it’s a mistake.” – Miles Davis. \n\nIf you’re not making a mistake, it’s a mistake.” – Miles Davis',
    style: { fill: '#d3429e' },
    fontSize: 20,
    textAlign: 'center',
    background: true,
  },
  {
    id: 'b5',
    x: 500,
    y: 200,
    height: 100,
    width: 400,
    shape: 'text',
    text:
      '“I\'m always thinking about creating. \nMy future starts when I wake up every morning... Every day I find something creative to do with my life" – Miles Davis',
    style: { fill: '#9e423e' },
    fontSize: 20,
    textAlign: 'left',
  },
  {
    id: 'b5',
    x: 600,
    y: 400,
    height: 40,
    width: 400,
    shape: 'text',
    text:
      '“If you’re not making a mistake, it’s a mistake.” – Miles Davis. \nIf you’re not making a mistake, it’s a mistake.” – Miles Davis',
    style: { fill: '#d3009e' },
    fontSize: 20,
    textAlign: 'right',
  },
  {
    id: 'b6',
    x: 0,
    y: 200,
    width: 100,
    height: 300,
    shape: 'rectangle',
    style: { fill: '#44ee55', line: '#222222', lineWidth: 5 },
  },
];

export function getAdd5Graph(inputGraph, bounds = { minX: -300, maxX:300, minY: - 300, maxY:300 }) {
  const g = inputGraph;
  const graph = {
    nodes: [...g.nodes],
    edges: [...g.edges],
    decorations: [...g.decorations || []],
  };

  for (let i = 0; i < 5; i++) {
    const nodeId = graph.nodes.length + 1;
    const nd = {
      id: nodeId.toString(),
      label: `${nodeId}`,
      style: { border: `#${Math.floor(Math.random() * 16777215).toString(16)}` },
      x: Math.random() * (bounds.maxX - bounds.minX) + bounds.minX,
      y: Math.random() * (bounds.maxY - bounds.minY) + bounds.minY,
      ...getShape(),
    };
    graph.nodes.push(nd);
    const edgeId = graph.edges.length + 1;
    const ed = {
      id: edgeId,
      style: { color: `#${Math.floor(Math.random() * 16777215).toString(16)}` },
      from: graph.nodes[graph.edges.length - 5]
        ? graph.nodes[graph.edges.length - 5].id.toString()
        : graph.nodes[3].id.toString(),
      to: nodeId.toString(),
      label: `edge ${edgeId}`,
    };
    graph.edges.push(ed);
  }

  // this will add an edge back to a parent from a descendant
  const edgeId = graph.edges.length + 1;
  const ed = {
    id: edgeId,
    from: graph.nodes[Math.floor(Math.random() * graph.nodes.length)].id.toString(),
    to: graph.nodes[0].id.toString(),
    label: `edge ${edgeId}`,
  };
  graph.edges.push(ed);

  return graph;
}

export function getRemove5Graph(inputGraph) {
  const graph = inputGraph;
  const newNodes = graph.nodes.slice(0, graph.nodes.length - 5);
  const nids = newNodes.map( n => n.id);

  const newEdges = [];
  graph.edges.forEach(e => {
    if (nids.includes(e.from) && nids.includes(e.to)) {
      newEdges.push(e);
    }
  });
  return graph;
}

export function getUpdate5Graph(inputGraph) {
  const g = inputGraph;
  const graph = {
    nodes: [...g.nodes],
    edges: [...g.edges],
    decorations: [...g.decorations],
  };
  for (let i = graph.nodes.length - 1; i > graph.nodes.length - 6; i--) {
    if (graph.nodes[i]) {
      graph.nodes[i] = {
        ...graph.nodes[i],
        label: `${graph.nodes[i].label} changed`,
        style: { background: '#660000' },
      };
    }
  }

  return graph;
}
