/* @flow */
/* eslint-disable no-underscore-dangle, no-param-reassign */
import { isEqual } from 'lodash';

import defaultLayouter from './layout/';
import Node from './Node';
import Edge from './Edge';
import Decoration from './Decoration';

const arrayToObject = array =>
  array.reduce((obj, item) => {
    obj[item.id] = item;
    return obj;
  }, {});

export default class ReVisDataSet {
  constructor(data, layouter, debug, options, screen, onLayoutStopped, onLayoutStarted) {
    this._screen = screen || { width: 600, height: 600 };
    this._options = options || {};
    this._layouter = layouter || defaultLayouter;
    this.debug = debug;
    this.nodes = [];
    this.edges = [];
    this.decorations = [];
    this.onLayoutStopped = onLayoutStopped;
    this.onLayoutStarted = onLayoutStarted;
    this.persistent = {};

    if (!data) {
      throw new Error('RevisDataSet must have data on creation.');
    } else if (!data.nodes || !Array.isArray(data.nodes)) {
      throw new Error('RevisDataSet data.nodes must be an array.');
    } else if (!data.edges || !Array.isArray(data.edges)) {
      throw new Error('RevisDataSet data.nodes must be an array.');
    }
    this._data = { nodes: [], edges: [], decorations: [] };
    this.data = data;
  }

  callOnLayoutStopped() {
    if (this.onLayoutStopped) {
      this.onLayoutStopped();
    }
  }

  callOnLayoutStarted() {
    if (this.onLayoutStarted) {
      this.onLayoutStarted();
    }
  }

  // returns all the positions of nodes in a map
  getPositions() {
    const ret = {};
    this.nodes.forEach(n => {
      ret[n.id] = { x: n.x, y: n.y, fixed: n.fixed };
    });
    return ret;
  }

  get bounds() {
    const startX = this.nodes[0] ? this.nodes[0].x : 0;
    const startY = this.nodes[0] ? this.nodes[0].y : 0;
    let minX = startX;
    let minY = startY;
    let maxX = startX;
    let maxY = startY;
    this.nodes.forEach(n => {
      minX = Math.min(minX, n.destination ? n.destination.x : n.x);
      minY = Math.min(minY, n.destination ? n.destination.y : n.y);
      maxX = Math.max(maxX, n.destination ? n.destination.x : n.x);
      maxY = Math.max(maxY, n.destination ? n.destination.y : n.y);
    });
    if (this.decorations && this.decorations[0] && this.decorations[0].useBoundaries) {
      const d = this.decorations[0];
      minX = Math.min(minX, d.x);
      minY = Math.min(minY, d.y);
      maxX = Math.max(maxX, d.x + d.width);
      maxY = Math.max(maxY, d.y + d.height);
    }
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  }

  get options() {
    return this._options;
  }

  set options(value) {
    if (!isEqual(this._options, value)) {
      // only replay layout of the options that changed are layout related
      if (
        value.layoutOptions &&
        value.layoutOptions.settings &&
        !isEqual(this._options.layoutOptions.settings, value.layoutOptions.settings)
      ) {
        this.refresh(false);
      }
      this._options = value;
    }
  }

  get screen() {
    return this._screen;
  }

  set screen(value) {
    this._screen = value;
  }

  get layouter() {
    return this._layouter;
  }

  set layouter(layouter) {
    this.wipeCoordinates();
    this._layouter = layouter;
    this.refresh(true);
  }

  // wipe coordinates when layouters change
  wipeCoordinates() {
    this.nodes.forEach(n => {
      n.fixed = false;
      n.x = null;
      n.y = null;
    });
  }

  get data() {
    return this._data;
  }

  set data(data) {
    // console.log('data changed', data);
    if (!isEqual(this._data, data)) {
      const st = new Date().getTime(); // logging start
      const nodesObj = arrayToObject(this._data.nodes);
      const newNodesObj = arrayToObject(data.nodes);

      // check for any changes
      const nodesChange = !isEqual(this._data.nodes, data.nodes);
      let nodesAdded = false;
      const edgesChange =
        !isEqual(this._data.edges, data.edges) || data.edges.length !== this.edges.length;
      const decorationsChange = !isEqual(this._data.decorations, data.decorations);

      const ed = new Date().getTime(); // logging end of figuring out if things changed

      if (nodesChange || edgesChange) {
        data.nodes.forEach(n => {
          const nid = n.id.toString();
          const connectedEdges = data.edges.filter(
            edd =>
              (edd.from.toString() === nid || edd.to.toString() === nid) &&
              edd.to.toString() !== edd.from.toString(),
          );
          n.mass = connectedEdges.length + 1; // add mass to node
          if (nodesObj[n.id] === undefined) {
            nodesAdded = true;
            this.nodes.push(new Node(n.id, n));
          } else if (!isEqual(n, nodesObj[n.id])) {
            const changeNode = this.nodes.find(nd => nd.id === n.id);
            if (changeNode) {
              changeNode.definition = { ...n }; // changing definition attributes without effecting other things etc..
              if ((n.x && changeNode.x !== n.x) || (n.y && changeNode.y !== n.y)) {
                changeNode.destination = { x: n.x, y: n.y };
              }
            }
          }
        });

        this._data.nodes.forEach(n => {
          if (newNodesObj[n.id] === undefined) {
            const rmNode = this.nodes.find(nd => nd.id === n.id);
            if (rmNode) {
              // update nodes
              this.nodes = this.nodes.filter(fn => fn !== rmNode);
            }
          }
        });
      }

      if (edgesChange || nodesChange) {
        const nextEdges = [];
        data.edges.forEach(e => {
          const fromNode = this.nodes.find(n => n.id === e.from.toString());
          const toNode = this.nodes.find(n => n.id === e.to.toString());
          // const currentEdge = this.edges.find(ed => ed.id === e.id);
          if (fromNode !== undefined && toNode !== undefined) {
            nextEdges.push(new Edge(e.id, e, toNode, fromNode));
          }
        });
        this.edges = nextEdges;

        // adds expected 'dupNumber' to edges that are have the same start and end so we can prevent overlap
        nextEdges.forEach(edg => {
          const filtered = nextEdges.filter(
            fe =>
              fe.definition.id !== edg.definition.id &&
              ((fe.definition.to === edg.definition.to &&
                fe.definition.from === edg.definition.from) ||
                (fe.definition.to === edg.definition.from &&
                  fe.definition.from === edg.definition.to)) &&
              fe.dupNumber < 1,
          );

          if (filtered.length > 0) {
            let dupCounter = 2;
            edg.dupNumber = 1;
            filtered.forEach(f => {
              f.dupNumber = dupCounter++;
            });
          }
        });
      }

      if (decorationsChange && data.decorations) {
        this.decorations = [];
        data.decorations.forEach(d => {
          this.decorations.push(new Decoration(d.id, d));
        });
      }

      const cp = new Date().getTime(); // logging pre-refresh

      // now set the new data for next comparison
      // if nodes were added, refresh the layouter
      this._data = data;
      if (nodesAdded || nodesChange) {
        this.refresh(true);
      } else if (edgesChange || decorationsChange) {
        this.refresh(false);
      }

      const ch = new Date().getTime(); // logging after refresh
      if (this.debug) {
        console.log('total', this.nodes.length, 'ed', ed - st, 'cp', cp - ed, 'ch', ch - cp);
      }
    }
  }

  // calls the layouter function whenever there is a change
  refresh(triggerOnLayoutStopped = true) {
    this.callOnLayoutStarted();
    this.layoutStopQued = triggerOnLayoutStopped || this.layoutStopQued;
    const refreshLayouter = () => {
      this.layouter(
        { nodes: this.nodes, edges: this.edges, decorations: this.decorations },
        this.options.layoutOptions || {},
        this.persistent,
        this.screen,
        this.bounds,
        () => {
          if (this.layoutStopQued) {
            this.callOnLayoutStopped();
            this.layoutStopQued = false; // set the que to false only after the layoutStopped funciont has run
          }
        },
      );
    };
    // debounce multiple refresh calls
    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(refreshLayouter, 500);
  }

  destroy() {
    clearTimeout(this.refreshTimer);
    // destroy everthing in persistent
    if (this.persistent.supervisor && this.persistent.supervisor.destroy !== undefined) {
      this.persistent.supervisor.destroy();
    }
  }
}
