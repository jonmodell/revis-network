const DEFAULT_STYLE = { background: '#ffffff', border: '#333333', lineWidth: 2, font: '16px lato' };
/*
Standard decorator class can call state.decoratorFunction to render.  Render will be called on each refresh.

*/
export default class Decoration {
  constructor(id, definition) {
    this.id = id ? id.toString() : null;
    this.definition = definition;
    this.x = definition.x || 0;
    this.y = definition.y !== undefined ? definition.y : 300;
    this.height = definition.height || 300;
    this.width = definition.width || 300;
    this.destination = null;
    this.shape = definition.shape || null;
    this.visible = false;
    this.style = null;
  }

  // allows style to be set from parent
  setStyle(style) {
    this.style = style;
  }

  destroy() {
    this.delete = true;
  }

  render(state, context, images, drawingFunction) {
    if (this.visible) {
      // calculate styles like css 1. this.style, 2. this.definition.style, 3. DEFAULT_STYLE
      const style = { ...DEFAULT_STYLE, ...(this.definition.style || {}), ...(this.style || {}) };

      // draw
      const ctx = context;

      ctx.save();
      if (drawingFunction) {
        drawingFunction(ctx, state, style, this);
      } else {
        ctx.translate(this.x, this.y);
        ctx.lineWidth = style.lineWidth || DEFAULT_STYLE.lineWidth;
        ctx.fillStyle = style.background || style.fillColor || DEFAULT_STYLE.background;
        ctx.strokeStyle = style.border || style.strokeColor || DEFAULT_STYLE.border;
        ctx.beginPath();
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}
