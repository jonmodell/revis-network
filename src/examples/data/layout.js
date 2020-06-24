const randomImageId = () => {
  const letters = ['a','b','c','d','e','f'];
  return letters[Math.floor(Math.random() * 5)];
}

const generateNodes = num => {
  const ret = [];
  for(let i = 1; i <= num; i++) {
    const node = { id: i, label: `label ${i}`, image: randomImageId() }
    ret.push(node);
  }
  return ret;
}

const generateEdges = nodes => {
  const ret = [];
  const len = nodes.length - 1;
  let count = len;
  while(count) {
    const edge = { 
      id: count,
      to: nodes[Math.floor(Math.random() * len)].id,
      from: nodes[Math.floor(Math.random() * len)].id
    }
    ret.push(edge);
    count--;
  }
  return ret;
}

const generateGraph = size => {
  const nodes = generateNodes(size);
  const ret = { nodes };
  ret.edges = generateEdges(nodes);
  return ret;
}

export default generateGraph;
