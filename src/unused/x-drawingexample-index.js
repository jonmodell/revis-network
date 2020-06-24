import React, { Component } from 'react';
import { cloneDeep } from 'lodash';
import styled from 'styled-components';
import ReVisNetwork from '../../';
import graph1 from './data';
import makeNodeShape from './nodeDrawing';
import makeShape from './shapeDrawing';

import {
  iconMap,
  testLayers,
  getAdd5Graph,
  getUpdate5Graph,
  getRemove5Graph,
  getHandles,
} from './functionsAndIcons';

const StyledCard = styled.div`
  position: absolute;
  width: 200px;
  max-height: 150px;
  overflow-y: auto;
`;

const ExampleContainer = styled.div`
  display: block;
  background-color: #f6f6f6;
  position: absolute;
  top: 50px;
  bottom: 20px;
  left: 20px;
  right: 20px;
  padding: 0;
  margin: 0;
  font-family: 'PT Mono', serif;
  color: #666666;

  .top-controls {
    top: -40px;
    position: relative;
  }
  select {
    height: 30px;
  }
  label {
    margin: 0 10px;
  }
  button,
  input[type='number'] {
    height: 30px;
    margin: 0 5px;
    padding: 0 8px;
    border-style: solid;
    border-color: #AAAAAAA;
    border-width: 1px;
    border-radius: 5px;
  }
`;

export default class Example extends Component {
  constructor(props) {
    super(props);
    this.layers = cloneDeep(testLayers);
    this.state = {
      graph: { ...graph1},
      selectedNodes: [],
      selectedEdges: [],
      mode: '',
      layers: this.layers,
      mapOpts: {
        editMode: false,
        edges: {
          lineStyle: 'straight',
          arrowheads: true,
          arrowPlacementRatio: 0.7,
          showLabels: true,
        },
        nodes: { showLabels: true },
        hover: {
          edgeRenderer: this.edgeRenderer.bind(this),
          nodeRenderer: this.nodeRenderer.bind(this)
        },
        layoutOptions: {},
      },
    };
  }

  // update functions -------------------------------------------------
  add5() {
    console.log('add 5');
    const graph = getAdd5Graph(this.state.graph);
    this.setState({ graph });
  }

  remove5() {
    const graph = getRemove5Graph(this.state.graph);
    this.setState({ graph });
  }

  update5() {
    const graph = getUpdate5Graph(this.state.graph);
    this.setState({ graph });
  }

  // normal mode handlers ---------------------------------------------
  onMouse(type, item, event, callBacker) {
    console.log('onMouse', type, item, event, callBacker);
    switch (type) {
      case 'backgroundClick':
        this.setState({ selectedNodes: [], selectedEdges: [] });
        break;
      case 'nodeClick':
        item.style = { background: '#dddddd', border: '#aaaaaa', lineWidth: 3.5 }
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          const newSelected = [...this.state.selectedNodes];
          newSelected.push(item.id);
          this.setState({ selectedNodes: newSelected });
        } else {
          this.setState({ selectedNodes: [item.id], selectedEdges: [] });
        }
        break;
      case 'edgeClick':
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          const newSelected = [...this.state.selectedEdges];
          newSelected.push(item.id);
          this.setState({ selectedEdges: newSelected });
        } else {
          this.setState({ selectedEdges: [item.id], selectedNodes: [] });
        }
        break;
      default:
        break;
    }
  }

  getNodeStyle(node) {
    if (this.state.selectedNodes.includes(node.id)) {
      return { background: '#dddddd', border: '#aaaaaa', lineWidth: 3.5 };
    }
    return null;
  }

  getEdgeStyle(edge) {
    if (this.state.selectedEdges.includes(edge.id)) {
      return { lineWidth: 7 };
    }
    return null;
  }

  // edit mode handlers --------------------------------------------------
  checkItemClick(n, pos) {
    if (
      n.noClick ||
      n.x === undefined ||
      n.y === undefined ||
      (n.size === undefined && n.width === undefined && n.height === undefined)
    ) {
      return false;
    }
    const bounds = {
      minX: n.x,
      maxX: n.x + (n.width || n.size),
      minY: n.y,
      maxY: n.y + (n.height || n.size),
    };
    if (
      pos.x > bounds.minX &&
      pos.x < bounds.maxX &&
      pos.y > bounds.minY &&
      pos.y < bounds.maxY
    ) {
      return true;
    }
    return false;
  }

  checkLayerClick(layer, pos) {
    if (!layer.data) {
      return false;
    }
    // for is more performant because we break when a node is found
    for (let i = 0; i < layer.data.length; i++) {
      const n = layer.data[i];
      const clicked = this.checkItemClick(n, pos);
      if (clicked) {
        return n;
      }
    }
    return false;
  }

  onEditMouse(type, pos) {
    if (type !== 'x') {
      if (type === 'down') {
        this.lastPos = pos;
        // check for collision on handles layer
        const clickedHandle = this.checkLayerClick(this.state.layers[0], pos);
        // check for collision with any object on layer 1
        const clickedItem = this.checkLayerClick(this.layers[1], pos);

        if (clickedItem) {
          this.selectedLayerItem = clickedItem;
          const layers = [...this.state.layers]; // will cause a change trigger for layers
          layers[0] = { ...layers[0], data: getHandles(clickedItem) };
          this.setState({ layers });
          this.dragLayerHandle = null;
          this.draggingLayerItem = true;
        } else if (clickedHandle) {
          this.dragLayerHandle = clickedHandle;
        } else {
          const layers = [...this.state.layers]; // will cause a change trigger for layers
          layers[0] = { ...layers[0], data: [] };
          this.setState({ layers });
          this.selectedLayerItem = null;
        }
      }

      if (type === 'move') {
        const si = this.selectedLayerItem;
        const dh = this.dragLayerHandle;
        if (!si) {
          return false;
        }
        const delta = { x: pos.x - this.lastPos.x, y: pos.y - this.lastPos.y };
        this.lastPos = pos;

        // handle movement
        if (dh && si) {
          switch (dh.id) {
            case 'lt':
              si.width = (si.width || si.size) - delta.x;
              si.x += delta.x;
              si.height = (si.height || si.size) - delta.y;
              si.y += delta.y;
              break;
            case 'lb':
              si.width = (si.width || si.size) - delta.x;
              si.x += delta.x;
              si.height = (si.height || si.size) + delta.y;
              break;
            case 'lm':
              si.width = (si.width || si.size) - delta.x;
              si.x += delta.x;
              break;
            case 'rt':
              si.width = (si.width || si.size) + delta.x;
              si.height = (si.height || si.size) - delta.y;
              si.y += delta.y;
              break;
            case 'rb':
              si.width = (si.width || si.size) + delta.x;
              si.height = (si.height || si.size) + delta.y;
              break;
            case 'rm':
              si.width = (si.width || si.size) + delta.x;
              break;
            case 'cb':
              si.height = (si.height || si.size) + delta.y;
              break;
            case 'ct':
              si.height = (si.height || si.size) - delta.y;
              si.y += delta.y;
              break;
            default:
              break;
          }
          // item movement
        } else if (si && this.draggingLayerItem) {
          si.x += delta.x;
          si.y += delta.y;
        }

        // redraw handles if there was anything selected
        if (si) {
          const layers = [...this.state.layers];
          layers[0] = { ...layers[0], data: getHandles(si) };
          this.setState({ layers });
        }
      }

      if (type === 'up') {
        this.dragLayerHandle = null;
        this.draggingLayerItem = false;
      }
    }
    return false;
  }

  // example controls changes --------------------------------------------
  onCheckbox(t, v) {
    console.log('layout changed', t, v);
    const mapOpts = { ...this.state.mapOpts };
    mapOpts.layoutOptions.settings[t] = v;
    this.setState({ mapOpts });
  }

  onModeCheckbox(t, v) {
    console.log('mode changed', t, v);
    const mode = v ? 'edit' : '';
    this.setState({ mode });
  }

  onLayersCheckbox() {
    this.setState({ layers: testLayers });
  }

  // ----------------------------------------------------------------------

  nodeRenderer() {
    return (
      <StyledCard>
        <div style={{ height: '600px', width: '100%', background: '#CCCCCC' }}>
          Content goes here
        </div>
      </StyledCard>
    );
  }

  edgeRenderer() {
    return (
      <StyledCard>
        <div style={{ height: '600px', width: '100%', background: '#CCCCCC' }}>
          Edge goes here
        </div>
      </StyledCard>
    );
  }

  render() {
    const { mapOpts, mode, layers } = this.state;
    return (
      <ExampleContainer className='example'>
        <div className='top-controls'>
          <button onClick={() => this.add5()}>Add 5</button>
          <button onClick={() => this.remove5()}>Remove 5</button>
          <button onClick={() => this.update5()}>Update 5</button>
          <label>
            edit mode
            <input
              type='checkbox'
              checked={mode === 'edit'}
              onChange={(e) => this.onModeCheckbox('mode', e.target.checked)}
            />
          </label>
          <button onClick={() => this.onLayersCheckbox()}>Add Layers</button>
        </div>

        <ReVisNetwork
          nodeDrawingFunction={makeNodeShape}
          getEdgeStyle={(edge) => this.getEdgeStyle(edge)}
          getNodeStyle={(node) => this.getNodeStyle(node)}
          graph={this.state.graph}
          images={iconMap}
          onMouse={(a, b, c, d) => this.onMouse(a, b, c, d)}
          onEditMouse={(type, pos) => this.onEditMouse(type, pos)}
          options={mapOpts}
          mode={mode}
          renderNodeDetail={this.renderNodeDetail}
          renderEdgeDetail={this.renderEdgeDetail}
          debug
          allowHoverRollover
          shapeDrawingFunction={makeShape}
          layers={layers}
          selected={{
            nodes: this.state.selectedNodes,
            edges: this.state.selectedEdges,
          }}
        />
      </ExampleContainer>
    );
  }
}
