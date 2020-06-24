export default {
  nodes: [
    {
      id: 'a',
      label: 'A',
      shape: 'circle',
    },
    {
      id: 'b',
      label: 'B',
      shape: 'diamond',
    },
    {
      id: 'c',
      label: 'C',
      shape: 'hexagon',
    },
    {
      id: 'd',
      label: 'D',
    },
  ],
  edges: [
    {
      id: 'ab',
      from: 'a',
      to: 'b',
      label: 'A to B',
    },
    {
      id: 'ac',
      from: 'a',
      to: 'c',
      label: 'A to C',
    },
  ],
};
