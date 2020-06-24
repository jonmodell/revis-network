const options = {
  nodes: {
    showLabels: true,
    defaultSize: 30,
    scaleCompensation: false,
  },
  edges: {
    showLabels: true,
    arrowheads: true,
    lineStyle: 'curved', // straight or curved
  },
  cameraOptions: {
    fitAllPadding: {
      horizontal: 60,
      vertical: 60,
    },
  },
  layoutOptions: {
    fitOnUpdate: true,
  },
  hover: {
    width: 200,
    height: 150,
    edgeRenderer: null,
    nodeRenderer: null,
    delay: 750,
  },
  blockGraphInteraction: false,
};

export default options;
