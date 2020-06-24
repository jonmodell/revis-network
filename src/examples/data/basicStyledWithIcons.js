export default {
  nodes: [
    {
      id: 'a',
      label: 'A is covered to look transparent',
      shape: 'circle',
      style: { border: '#CC6666', opacity: 0.5 },
      image: 'a',
      innerLabel:
        'inner A has cover color and a very long label indeed and should be truncated',
    },
    {
      id: 'b',
      label: 'B has a long label and inner label',
      shape: 'diamond',
      style: { border: '#66CC66' },
      image: 'b',
      innerLabel: 'inner B long label should be trunk',
    },
    {
      id: 'c',
      label: 'C',
      shape: 'hexagon',
      style: { border: '#6666CC', opacity: 0.5 },
      image: 'e',
      innerLabel: 'inner C',
    },
    {
      id: 'd',
      label: 'D',
      style: { border: '#CC66CC', lineWidth: 5 },
      image: 'f',
      innerLabel: 'inner D',
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
