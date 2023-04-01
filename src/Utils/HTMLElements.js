import Experience from "../Experience";

export default class HTMLElements {
    // Static counter for canvas id's
    static #countIds = 0;

    // constructor
    constructor() {
        this.experience = new Experience();
        this.options    = this.experience.options;
        this.sizes      = this.experience.sizes;
        
        this.create();
    }

    create() {
        // Si no hay una ID asignada es que no se ha creado la etiqueta OCanvas para este objeto
        if (typeof(this.id) === 'undefined') {
            // Creo las etiquetas necesarias para el canvas, los botones, el framerate y la carga
            const preElementExperience = document.createElement("div");
            // Asigno la id para este Canvas, y sumo 1 al contador de ids estatico
            this.id = HTMLElements.#countIds ++;
            preElementExperience.id        = "Experience" + this.id; 
            preElementExperience.className = "Experience";
            // Añado la etiqueta que contiene todas las etiquetas de este OCanvas
            this.options.rootElement.appendChild(preElementExperience);
            this.elementExperience = document.getElementById(preElementExperience.id);
            // Setup the loading atribute
            this.elementExperience.setAttribute("loading", true);
            // Creo un string para crear las etiquetas HTML
            let strHTML = ""
            // Añado la etiqueta para el canvas
            strHTML += '<canvas id="Experience' + this.id + '_Canvas" class="Experience_Canvas"></canvas>';
            // Añado la etiqueta para el marco que indica que se está cargando
            strHTML += '<div class="Experience_Loading Experience_Panel"><span>Loading...</span></div>';
            // Añado la etiqueta para el marco de los controles
            strHTML += '<div class="Experience_Controls">';
            // Show FPS
            if (this.options.showFPS === true) {
                strHTML +=  "<div class='Experience_Panel Experience_Control' title='Frames Per Second'>" +
                                "<div class='Experience_FPS'>60</div>" +
                                "<div class='Experience_TxtFPS'>fps</div>" +
                            "</div>";
            }
            // Show full screen button
            if (this.options.buttonFullScreen === true) {
                strHTML +=  "<div class='Experience_Panel Experience_Control' title='Togle Full Screen'>" +
                            "</div>";
            }
            // Show devildrey33 logo button
            if (this.options.buttonLogo === true) {
                strHTML +=  "<div class='Experience_Panel Experience_Control' title='devildrey33 home page'>" +
                            "</div>";
            }
            // Cierro el div .Experience_Controls
            strHTML += '</div>';
            
            // Añado el string con todas las nuevas etiquetas al DOOM dentro de la etiqueta OCanvas
            this.elementExperience.innerHTML = strHTML;

            // Obtengo la etiqueta del canvas 
            this.elementCanvas = document.querySelector("#" + this.elementExperience.id + " > .Experience_Canvas")
            // Obtengo la etiqueta del marco para la carga
            this.elementLoading = document.querySelector("#" + this.elementExperience.id + " > .Experience_Loading")
            // Obtengo la etiqueta del marco para los controles
            this.elementControls = document.querySelector("#" + this.elementExperience.id + " > .Experience_Controls")
            // if FPS are show
            if (this.options.showFPS === true) {
                // Get FPS html element from the doom
                this.elementFPS = document.querySelector("#" + this.elementExperience.id + " > .Experience_Controls > .Experience_Control > .Experience_FPS")
            }
        }

        // Determino el ancho y altura del canvas (fijo o variable)
        if (this.options.width  === "auto") { this.width  = this.options.width;  }
        if (this.options.height === "auto") { this.height = this.options.height; }        
        // Si el canvas es de ancho fijo, añado el css para centrar-lo
        if (this.options.width  !== "auto") { 
            this.sizes.width = this.options.width;
            this.elementCanvas.style.width  = this.sizes.width  + "px"; 
        }
        if (this.options.left  === "auto") { 
            this.elementCanvas.style.left   = "calc(50% - (" + this.width  + "px / 2))"; 
        }

        if (this.options.height !== "auto") { 
            this.sizes.height = this.options.height;
            this.elementCanvas.style.height = this.height + "px"; 
        }
        if (this.options.top  === "auto") { 
            this.elementCanvas.style.top    = "calc(50% - (" + this.height + "px / 2))"; 
        }

        // Actualizo las posiciones
//        this.eventResize();
    }
}