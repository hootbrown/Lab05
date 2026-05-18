/**
 * @file profileUiController.js
 * Handles all DOM interaction: element references, event listener registration,
 * and event handlers.
 */

import CanvasModel from './canvasModel.js';

// DOM References: Image and Canvas
const hiddenImageElement = document.getElementById('hiddenImage');
const canvasElement = document.getElementById('canvas');
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

export const canvasModel = new CanvasModel();

// ==========================================
// EVENT HANDLERS
// ==========================================

/**
 * Reads the picked file as a base64 data URL so the image source is
 * self-contained and survives any later refactor toward localStorage persistence.
 */
function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setImageElement(e.target.result);
        reader.readAsDataURL(file);
    }
}

/** Re-renders on every keystroke so the preview tracks the input live. */
function handleTopTextChange(event) {
    canvasModel.topText = event.target.value;
    canvasModel.render(canvasElement);
    canvasModel.storeInLocalStorage();
}

/** Re-renders on every keystroke so the preview tracks the input live. */
function handleBottomTextChange(event) {
    canvasModel.bottomText = event.target.value;
    canvasModel.render(canvasElement);
    canvasModel.storeInLocalStorage();
}

function handleFilterChange(event) {
    canvasModel.filter = event.target.value;
    canvasModel.render(canvasElement);
    canvasModel.storeInLocalStorage();
}

function handlefontSelectChange(event) {
    canvasModel.fontSelect = event.target.value;
    canvasModel.render(canvasElement);
    canvasModel.storeInLocalStorage();
}

function handleBGColorChange(event) {
    canvasModel.bgColor = event.target.value;
    canvasModel.render(canvasElement);
    canvasModel.storeInLocalStorage();
}

function handleframeSelectChange(event) {
    canvasModel.frameSelect = event.target.value;
    canvasModel.render(canvasElement);
    canvasModel.storeInLocalStorage();
}

function handleScaleChange(event) {
    canvasModel.scale = parseFloat(event.target.value);
    canvasModel.render(canvasElement);
    canvasModel.storeInLocalStorage();
}

/**
 * Refreshes the anchor's href with a PNG of the current canvas just before the
 * browser's default click action fires; the anchor's `download` attribute then
 * handles the file save, so no preventDefault or synthetic click is needed.
 */
function handleDownloadClick(event) {
    event.currentTarget.href = canvasElement.toDataURL('image/png');
}

 function handleMouseDown(e) {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
}
 
    function handleMouseUp(e){
      isDragging=false;
    } 

   
    
  function handleMouseMove(e) {
    if (isDragging) {
        canvasModel.offsetX += e.clientX - dragStartX;
        canvasModel.offsetY += e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        canvasModel.render(canvasElement);
    }
} 

// ==========================================
// SETUP FUNCTIONS
// ==========================================

/** Registers all event listeners. */
function setupEventListeners() {
    document.getElementById('image').addEventListener('change', handleImageChange);
    document.getElementById('topText').addEventListener('input', handleTopTextChange);
    document.getElementById('bottomText').addEventListener('input', handleBottomTextChange);
    document.getElementById('downloadPic').addEventListener('click', handleDownloadClick);
    document.getElementById('filterSelect').addEventListener('change', handleFilterChange);
    document.getElementById('bgColor').addEventListener('input', handleBGColorChange);
    document.getElementById('frameSelect').addEventListener('change', handleframeSelectChange);
    document.getElementById('fontSelect').addEventListener('change', handlefontSelectChange);
    document.getElementById('zoomRange').addEventListener('input', handleScaleChange);
    canvasElement.addEventListener('mousedown', handleMouseDown);
    canvasElement.addEventListener('mouseup', handleMouseUp);
    canvasElement.addEventListener('mousemove', handleMouseMove);
    }

/**
 * Sets the hidden image element's src, wires it to the model, and renders on load.
 * @param {string} url - Path or data URL for the image.
 */
function setImageElement(url) {
    canvasModel.imageUrl = url;
    hiddenImageElement.src = url;
    canvasModel.image = hiddenImageElement;
    hiddenImageElement.onload = () => {
        canvasModel.render(canvasElement);
         canvasModel.storeInLocalStorage();
    };
}

/** Sizes the canvas to fit the viewport (capped at 500px). */
function sizeCanvas() {
    canvasElement.height = Math.min(500, window.innerWidth - 30);
    canvasElement.width = Math.min(500, window.innerWidth - 30);
}

/**
 * Initializes the application: wires up event listeners, sizes the canvas,
 * and renders the default image so the canvas is never empty.
 */
export function init() {
    const DEFAULT_IMAGE_FILE = "./images/defaultProfileImage.jpg";

    setupEventListeners();
    sizeCanvas();
    setImageElement(DEFAULT_IMAGE_FILE);
    const saved = CanvasModel.loadFromLocalStorage();
      if (saved) {
        Object.assign(canvasModel, saved);
        document.getElementById('topText').value = saved.topText;
        document.getElementById('bottomText').value = saved.bottomText;
        document.getElementById('filterSelect').value = saved.filter;
        document.getElementById('bgColor').value = saved.bgColor;
        setImageElement(saved.imageUrl);
        document.getElementById('zoomRange').value = saved.scale;
    } else {
        // Pull HTML defaults into the model so the first render matches what the form shows.
        canvasModel.scale = parseFloat(document.getElementById('zoomRange').value);
        setImageElement(DEFAULT_IMAGE_FILE);
    }
}
