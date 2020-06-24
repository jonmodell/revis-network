const hexRandom = () => Math.floor(Math.random() * 16777215).toString(16);
const styleRandom = (n) => ({
  border: `#${hexRandom()}`,
  lineWidth: 2,
});

const shapeRandom = () => {
  return ['circle', 'diamond', 'hexagon', 'square'][
    Math.floor(Math.random() * 4)
  ];
};

const typeRandom = () =>
  [
    { type: 'businessservice', shape: 'hexagon' },
    { type: 'itservice', shape: 'hexagon' },
    { type: 'deviceservice', shape: 'hexagon' },
    { type: 'application', shape: 'diamond' },
    { type: 'applicationcomponent', shape: 'diamond' },
    { type: 'device', shape: 'square' },
    { type: 'unknown', shape: 'circle' },
  ][Math.floor(Math.random() * 7)];

const imageRandom = () => {
  return ['a', 'b', 'c', 'd', 'e', 'f'][Math.floor(Math.random() * 6)];
};

const genNodes = (n) => {
  let i = n;
  const ret = [];
  while (i) {
    ret.push({
      id: i.toString(),
      label: `node ${i}`,
      style: styleRandom(true),
      size: 50,
      image: imageRandom(),
      ...typeRandom(),
    });
    i--;
  }
  return ret;
};

const genEdges = (nodes) => {
  const ret = [];
  let i = Math.ceil(nodes.length * 1.5);
  while (i) {
    // get a node for either side
    const to = nodes[Math.floor(Math.random() * nodes.length)].id;
    const from = nodes[Math.floor(Math.random() * nodes.length)].id;
    ret.push({
      id: `${to}${from}`,
      to,
      from,
      label: `${to} to ${from}`,
      style: styleRandom(),
    });

    i--;
  }
  return ret;
};

export default function genGraph(n) {
  const nodes = genNodes(n);
  const edges = genEdges(nodes);
  return { nodes, edges };
  console.log('generated', { nodes, edges });
}
