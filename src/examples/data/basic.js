export default {
  nodes: [
    {
      id: 'a',
      label: 'A',
    },
    {
      id: 'b',
      label: 'B',
    },
    {
      id: 'c',
      label: 'C',
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
