import { useReducer } from 'react';

export const initialInteraction = {
  action: null,
  draggedNodes: [],
  dragMouseMoved: false,
  shape: null,
  shapeHandle: null,
};

const actionTypes = {
  addToDrag: 'addToDrag',
  edgeDown: 'edgeDown',
  endLayout: 'endLayout',
  handleDown: 'handleDown',
  handleMove: 'handleMove',
  handleUp: 'handleUp',
  mouseMoved: 'mouseMoved',
  pan: 'pan',
  releaseDrag: 'releaseDrag',
  reset: 'reset',
  runLayout: 'runLayout',
  shapeDown: 'shapeDown',
  shapeMove: 'shapeMove',
  shapeUp: 'shapeUp',
};

function interactionReducer(state, action) {
  switch (action.type) {
    case actionTypes.addToDrag: {
      return {
        ...state,
        action: 'drag',
        draggedNodes: action.payload,
      };
    }
    case actionTypes.edgeDown: {
      return {
        ...state,
        action: 'edgeDown',
        mouseMoved: false,
        draggedNodes: [],
      };
    }
    case actionTypes.pan: {
      return {
        ...state,
        action: 'pan',
        shape: null,
        shapeHandle: null,
        draggedNodes: [],
        mouseMoved: false,
      };
    }
    case actionTypes.releaseDrag: {
      return {
        ...state,
        action: null,
        dragMouseMoved: false,
      };
    }
    case actionTypes.mouseMoved: {
      return {
        ...state,
        mouseMoved: true,
      };
    }
    case actionTypes.runLayout: {
      return {
        ...state,
        action: 'layout',
      };
    }
    case actionTypes.endLayout: {
      return {
        ...state,
        action: null,
      };
    }
    case actionTypes.shapeDown: {
      return {
        ...state,
        action: 'shapeDrag',
        shapeHandle: null,
        mouseMoved: false,
        shape: action.payload,
      };
    }
    case actionTypes.shapeUp: {
      return {
        ...state,
        action: null,
        shapeHandle: null,
      };
    }
    case actionTypes.shapeMove: {
      return {
        ...state,
        mouseMoved: true,
      };
    }

    case actionTypes.handleDown: {
      return {
        ...state,
        action: 'handleDrag',
        mouseMoved: false,
        shapeHandle: action.payload,
      };
    }

    case actionTypes.handleMove: {
      return {
        ...state,
        mouseMoved: true,
      };
    }

    case actionTypes.reset: {
      return { ...initialInteraction, action: state.action };
    }
    default: {
      throw new Error(`Unhandled type: ${action.type}`);
    }
  }
}

export default function useInteraction({ reducer = interactionReducer } = {}) {
  const [interactionState, dispatch] = useReducer(reducer, initialInteraction);
  return { interactionState, interactionDispatch: dispatch };
}
