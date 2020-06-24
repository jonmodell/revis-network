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
    {
      id: 'e',
      label: 'E',
    },
    {
      id: 'f',
      label: 'F',
    },
    {
      id: 'g',
      label: 'G',
    },
    {
      id: 'h',
      label: 'H',
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
    {
      id: 'cd',
      from: 'c',
      to: 'd',
      label: 'C to D',
    },
    {
      id: 'ed',
      from: 'e',
      to: 'd',
      label: 'E to D',
    },
    {
      id: 'ef',
      from: 'e',
      to: 'f',
      label: 'E to F',
    },
    {
      id: 'fg',
      from: 'f',
      to: 'g',
      label: 'F to G',
    },
    {
      id: 'fh',
      from: 'f',
      to: 'h',
      label: 'F to H',
    },
  ],
};
