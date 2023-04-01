
/* BufferCanvas its an object that creates a canvas in memory */
export default class BufferCanvas {
    constructor(width, height) {
        this.canvas  = document.createElement("canvas");
        this.canvas.setAttribute("width", width);
        this.canvas.setAttribute("height", height);
        this.context = this.canvas.getContext("2d", { willReadFrequently : true }); 
        this.width   = width;
        this.height  = height;    

    }

    debug_InsertCanvasIntoBody() {
        document.body.appendChild(this.canvas);
        this.canvas.style.zIndex = 100;
        this.canvas.style.position = "fixed";
        this.canvas.style.top = 0;
    }
}