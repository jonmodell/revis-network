import React, { useMemo } from 'react';
import { action } from '@storybook/addon-actions';
import {
  withKnobs,
  text,
  boolean,
  number,
  button,
} from '@storybook/addon-knobs';
import ReVisNetwork from '..';
import data from '../examples/data/basic';
// import moreData from '../examples/data/moreBasic';
import randomData from '../examples/data/random';
import shapeData from '../examples/data/basicShapes';
import shapeColorData from '../examples/data/basicStyled';
import shapeIconData from '../examples/data/basicStyledWithIcons';
import nodeDrawing from '../examples/drawing/nodeDrawing';
import images from '../examples/data/images';

export default {
  title: 'Basic',
  component: ReVisNetwork,
  decorators: [withKnobs],
};

const actions = {
  onMouse: action('onMouse'),
};

let callbackProps = null;

export const Basic = () => (
  <div>
    <h2>
      This is a basic example with very few props in the data, and no other
      options set.
    </h2>
    <ReVisNetwork graph={data} {...actions} />
  </div>
);

export const WithOptions = () => {
  const callbackFn = (props) => {
    console.log('callback props', props);
    callbackProps = props;
  };
  const generateNodes = number('Number of Nodes', 4);
  const nodeSize = number('Node Size', 30);
  const blockGraphInteraction = boolean('Block Interaction?', false);
  const showNodeLabels = boolean('Show Node Labels', true);
  const showEdgeLabels = boolean('Show Edge Labels', true);
  const straightEdges = boolean('Straight Edges', false);
  const arrowheads = boolean('Edge Arrows', false);
  const arrowPlacementRatio = number('Arrow Placement', 0.5, {
    range: true,
    min: 0.2,
    max: 0.8,
    step: 0.05,
  });
  const getPositions = button('Log Node Positions', () => {
    const ret = callbackProps.gp();
    console.log(ret);
  });
  const fit = button('Call Fit', () => {
    callbackProps.fit();
  });
  const graph = useMemo(() => randomData(generateNodes), [generateNodes]);

  return (
    <div>
      <h2>A demonstration, with knobs below, of some basic options.</h2>
      <ReVisNetwork
        graph={graph}
        {...actions}
        options={{
          nodes: {
            showLabels: showNodeLabels,
            defaultSize: nodeSize,
          },
          edges: {
            showLabels: showEdgeLabels,
            lineStyle: straightEdges ? 'straight' : 'curved',
            arrowheads,
            arrowPlacementRatio,
          },
          blockGraphInteraction,
        }}
        images={images}
        callbackFn={callbackFn}
      />
    </div>
  );
};

export const NodeShapes = () => (
  <div>
    <h2>Now with a nodeDrawingFunction that uses the node 'shape' property.</h2>
    <ReVisNetwork
      graph={shapeData}
      nodeDrawingFunction={nodeDrawing}
      {...actions}
    />
  </div>
);

export const BorderColors = () => (
  <div>
    <h2>
      Style added to the nodes and edges can provide color and line options.
    </h2>
    <ReVisNetwork
      graph={shapeColorData}
      nodeDrawingFunction={nodeDrawing}
      {...actions}
    />
  </div>
);

export const ImagesAndInnerLabels = () => (
  <div>
    <h2>
      You can also use svg or raster images as icons and add innerLabel props.
    </h2>
    <ReVisNetwork
      graph={shapeIconData}
      options={{
        coverColor: 'rgba(240,240,240,0.6)',
      }}
      nodeDrawingFunction={nodeDrawing}
      images={images}
      {...actions}
    />
  </div>
);

export const NoZoomControls = () => (
  <div>
    <h2>
      customControls allows you to implement your own controls, or hide the
      defaults.
    </h2>
    <ReVisNetwork graph={shapeIconData} customControls={null} />
  </div>
);
