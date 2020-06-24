# Revis-Network
A react based canvas networking visualization pacakage

This was built with using the react transform boilerplate from
https://github.com/gaearon/react-transform-boilerplate

### Nodes: 
An array of json objects that, at the very least have unique .id properties. It may also contain the following supported properties
```
{
  id: a unique string (the only required property),
  label: a string to be printed along with the node,
  image: an svg image to be used with the nade,
  shape: one of "diamond", "hexagon", "square" or "circle", thou you can support this any way you want with your own .nodeDrawingFunction as a property of your RevisNetwork instance,
}
```

Conceptually, the node will call it's nodeDrawingFunction if there is one.  In this way you can support named properties in any way you see fit.

### Edges: 
An arry of json objects that, at the very least have the following properties
```
{ 
  id: a unique string (required),
  from: the id of a node in the nodes array that represents the start point of the edge (required),
  to: the id of a node in the nodes array that represents the end point of the edge (required),
}
```

### Decorations:
The ReVisDataset will create an array of .decoration instances.  This can be instantiated from JSON, or be left empty.

For example, a decoration can be defined with x, y, width and height or even with an image source, and the default render will show as 
a rectangle with the given coordinates and dimensions. 

The REAL power of decorations: your layouter can use the defined decorators, or create it's own and add them to the dataset.  This 
in conjunctions with an option on the network instance called .decoratorDrawingFunction can be used to draw most anything you can 
imagine based on whatever data you provide dynamically.

The decoratorDrawingFunction will be passed the canvas context, the current state, calculated style and the decoration instance, assuming 
you will want to use the context to provide some drawing instructions based on the instance, state and style.


### Layers:
Layers are handled outside of the RevisDataset and are expected to be an array of JSON objects with the following signature

```
{
  data: an array of nodes, preferably with ids and any properties needed to be drawn by the ..
  drawingFunction: a function used to translate data items into drawing instructions for the canvas  
  placement: "forground" or "background",
  visible; true or false,
}
```

Revis will create a canvas for each layer and pass the data through its own LayerItem class, which in turn will pass it through the drawing function.  Using foreground and background layers you can render drawings, text or images on seperate layers in front of, or behind, your graph.  See the `LayersandShapesExample.js` file in examples for a demonstration.

## Install and run

```
npm install
cd example
npm start
```

## Example
The example should open automatically when your run `npm start` on the example folder, but if not go to:

Open http://localhost:3035
