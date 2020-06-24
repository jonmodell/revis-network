export default {
  nodes: [
    {
      id: 'a',
      label: 'A',
      shape: 'circle',
      style: { border: '#CC6666' },
    },
    {
      id: 'b',
      label: 'B',
      shape: 'diamond',
      style: { border: '#66CC66' },
    },
    {
      id: 'c',
      label: 'C',
      shape: 'hexagon',
      style: { border: '#6666CC' },
    },
    {
      id: 'd',
      label: 'D',
      style: { border: '#CC66CC', lineWidth: 5 },
    },
  ],
  edges: [
    {
      id: 'ab',
      from: 'a',
      to: 'b',
      label: 'A to B',
      style: { color: '#66CC66', lineWidth: 10 },
    },
    {
      id: 'ac',
      from: 'a',
      to: 'c',
      label: 'A to C',
      style: { color: '#CCCC66' },
    },
  ],
};
