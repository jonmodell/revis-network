import React from 'react';
import ReVisNetwork from '..';
import randomData from '../examples/data/random';
import images from '../examples/data/images';
import multiParentHierarchical from '../examples/layouts/multiParentHierarchical';
import force from '../examples/layouts/force';
import tieredDecorator from '../examples/layouts/tieredDecorator';
import decorations from '../examples/layouts/tieredDecorator/shapes';
import decorationsDrawingFunction from '../examples/layouts/tieredDecorator/shapeDrawing';
import nodeDrawing from '../examples/layouts/tieredDecorator/nodeDrawing';

export default {
  title: 'Layout',
  component: ReVisNetwork,
};

export const Hierarchy = () => (
  <ReVisNetwork
    graph={randomData(100)}
    images={images}
    options={{
      edges: { arrowheads: true },
      layoutOptions: { isDirected: true },
    }}
  />
);

export const MultiParentHierarcy = () => (
  <ReVisNetwork
    graph={randomData(100)}
    layouter={multiParentHierarchical}
    images={images}
  />
);

export const D3Force = () => (
  <ReVisNetwork graph={randomData(100)} layouter={force} images={images} />
);

export const TieredHierarchy = () => (
  <ReVisNetwork
    graph={randomData(20)}
    layouter={tieredDecorator}
    images={images}
    shapes={decorations}
    nodeDrawingFunction={nodeDrawing}
    shapeDrawingFunction={decorationsDrawingFunction}
  />
);
