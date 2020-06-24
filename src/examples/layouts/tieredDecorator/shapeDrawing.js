const DEFAULT_STYLE = {
  background: '#ffffff',
  border: '#333333',
  lineWidth: 2,
  font: '16px lato, Arial',
};

/* @flow */
/*
instead of having the node support predefined states like selected, hovering, faded, etc...
have animations run from methods like bounce() or even animate(animateFunction => sizeModifier)

have the node call state.getStyleForNode(definition) => {background, border, lineWidth} to get
style information.  The node would not hold status or state properties, those would have to be 
kept in the implementation - a list of selected, faded, etc... to figure out the style
*/
const tieredDecorator = (ctx, node) => {
  ctx.beginPath();
  ctx.fillRect(-8000, 0, 16000, node.height);
  ctx.closePath();

  // text
  ctx.save();
  ctx.translate(-150, 20);
  ctx.fillStyle = '#333333';
  ctx.font = DEFAULT_STYLE.font;
  ctx.textAlign = 'left';
  ctx.fillText(node.label || 'undef', 0, 0);
  ctx.restore();
};

export default tieredDecorator;
