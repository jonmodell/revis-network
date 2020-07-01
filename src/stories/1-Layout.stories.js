import React from 'react';
import { action } from '@storybook/addon-actions';
import {
  withKnobs,
  boolean,
  number,
  button,
  select,
} from '@storybook/addon-knobs';
import ReVisNetwork from '..';
import randomData from '../examples/data/random';
import images from '../examples/data/images';
import multiParentHierarchical from '../examples/layouts/multiParentHierarchical';
import hierarchical from '../examples/layouts/hierarchical';
import force from '../examples/layouts/force';
import tieredDecorator from '../examples/layouts/tieredDecorator';
import decorations from '../examples/layouts/tieredDecorator/shapes';
import decorationsDrawingFunction from '../examples/layouts/tieredDecorator/shapeDrawing';
import nodeDrawing from '../examples/layouts/tieredDecorator/nodeDrawing';

export default {
  title: 'Layout',
  component: ReVisNetwork,
  decorators: [withKnobs],
};

const actions = {
  onMouse: action('onMouse'),
};

const graph = randomData(100);
const graph50 = randomData(50);

export const Hierarchy = () => {
  const horizontalNodeSpacing = number('Horizontal Spacing', 100);
  const verticalNodeSpacing = number('Vertical Spacing', 100);
  const spaceNodesByScreenSize = boolean('Space Nodes By Screen Size', false);
  const isDirected = boolean('Use Edge Direction', true);
  const directionOptions = {
    'Up to Down': 'UD',
    'Down to Up': 'DU',
    'Left to Right': 'LR',
    'Right to Left': 'RL',
  };
  const direction = select('Layout Direction', directionOptions, 'UD');
  return (
    <ReVisNetwork
      graph={graph}
      {...actions}
      images={images}
      options={{
        layoutOptions: {
          horizontalNodeSpacing,
          verticalNodeSpacing,
          isDirected,
          direction,
          spaceNodesByScreenSize,
        },
      }}
      layouter={hierarchical}
    />
  );
};

export const MultiParentHierarcy = () => {
  const horizontalNodeSpacing = number('Horizontal Spacing', 100);
  const verticalNodeSpacing = number('Vertical Spacing', 100);
  const spaceNodesByScreenSize = boolean('Space Nodes By Screen Size', false);

  return (
    <ReVisNetwork
      graph={graph}
      layouter={multiParentHierarchical}
      images={images}
      options={{
        layoutOptions: {
          horizontalNodeSpacing,
          verticalNodeSpacing,
          spaceNodesByScreenSize,
        },
      }}
    />
  );
};

export const D3Force = () => {
  const forceNodeSpacing = number('Node Spacing', 5);
  const alphaMin = number('Alpha Min', 0.05);
  const forceTypeOptions = {
    Centered: 'forceCenter',
    'Directed Tree': 'directedTree',
    Disjoint: 'disjoint',
  };
  const forceType = select('Layout Type', forceTypeOptions, 'directedTree');

  return (
    <ReVisNetwork
      graph={graph}
      layouter={force}
      images={images}
      options={{ layoutOptions: { forceNodeSpacing, forceType, alphaMin } }}
    />
  );
};

export const TieredHierarchy = () => {
  const horizontalNodeSpacing = number('Horizontal Spacing', 50);
  const verticalNodeSpacing = number('Vertical Spacing', 100);
  const decoratorSpacing = number('Decorator Spacing', 20);

  return (
    <ReVisNetwork
      graph={graph50}
      layouter={tieredDecorator}
      images={images}
      options={{
        layoutOptions: {
          horizontalNodeSpacing,
          verticalNodeSpacing,
          decoratorSpacing,
        },
      }}
      shapes={decorations}
      nodeDrawingFunction={nodeDrawing}
      shapeDrawingFunction={decorationsDrawingFunction}
    />
  );
};
