import React from 'react';
/* @flow */

type CustomControlsFn = (
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
) => void;

type CustomControlsData = {
  zoomIn: CustomControlsFn,
  zoomOut: CustomControlsFn,
  fitAll: CustomControlsFn,
  fitSelection: CustomControlsFn,
};

export type Props = {
  blockGraphInteraction: string,
  className: string,
  customControls: (data: CustomControlsData) => React.Node,
  debug: boolean,
  graph: { nodes: [any], edges: [any] },
  handler: (type: string, payload: any) => void,
  images: {},
  identifier: string,
  layouter: (data: any, options: any, screen: any) => void,
  nodeDrawingFunction: (context: any, definition: any, size: number) => void,
  onEditMouse: (type: string, pos: any, ctrlClic: boolean) => void,
  onMouse: (type: string, items: any, event: any, network: any) => void,
  options: {},
  reducer: () => { state: any },
  shapes: [{ data: any, drawingFunction: () => void }],
  shapeDrawingFunction: (context: any, definition: any, size: number) => void,
};
