/**
 * @file canvasModel.js
 * Plain data model holding all settings needed to render the canvas.
 */

import * as LenaJS from "lena.js";

const STORAGE_KEY = "profileMaker";

/**
 * Stores the current state of the canvas rendering parameters and draws itself.
 */
export default class CanvasModel {
  constructor() {
    /** @type {HTMLImageElement|null} The image to draw on the canvas. */
    this.image = null;
    /** @type {string|null} URL or data URL of the image, used for persistence. */
    this.imageUrl = null;
    /** @type {string} */
    this.topText = "";
    /** @type {string} */
    this.bottomText = "";
    /** @type {string} */
    this.bgColor = "#000000";
    /** @type {string} */
    this.frameSelect = "none";
    /** @type {string} Active filter name (e.g. 'none', 'grayscale'). */
    this.filter = "none";
    /** @type {number} Scale multiplier (1 = original size). */
    this.scale = 1;
    /** @type {number} Rotation in degrees. */
    //this.rotate = 0;
    this.fontSelect = "sans-serif";
    this.offsetX = 0;
    this.offsetY = 0;
  }

  storeInLocalStorage() {
    const { image, ...serializable } = this;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // QuotaExceededError: data URL too large — silently skip
    }
  }

  static loadFromLocalStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Clears the canvas, draws the current image stretched to fill it, then
   * layers the top and bottom text on top.
   * @param {HTMLCanvasElement} canvasElement
   */
  render(canvasElement) {
    const ctx = canvasElement.getContext("2d");
    const { width, height } = canvasElement;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "#FFD700");
    gradient.addColorStop(1, "#FFA500");

    ctx.beginPath();
    //ctx.clearRect(0, 0, width, height);
    //MADE IT CIRCULAR WOO
    ctx.arc(width / 2, height / 2, width / 2, 0, 2 * Math.PI);
    ctx.clip();
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, width, height);
    

    if (this.image) {
      ctx.save();

      ctx.translate(width / 2 + this.offsetX, height / 2 + this.offsetY);
      ctx.rotate((this.rotate * Math.PI) / 180);
      ctx.scale(this.scale, this.scale);
      ctx.translate(-width / 2, -height / 2);
      ctx.drawImage(this.image, 0, 0, width, height);
      ctx.restore();
    }

    if (this.filter !== "none") {
      const imageData = ctx.getImageData(0, 0, width, height);
      ctx.putImageData(LenaJS[this.filter](imageData), 0, 0);
    }

    switch (this.frameSelect) {
      case "black":
        ctx.strokeStyle = "black";
        ctx.lineWidth = 20;
        ctx.stroke();
        break;
      case "gold":
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 20;
        ctx.stroke();
        break;
      case "neon":
        ctx.shadowBlur = 20;
        ctx.shadowColor = "cyan";
        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 20;
        ctx.stroke();
        break;

    }

    ctx.shadowBlur = 0;
    

    this.#drawText(ctx, canvasElement);
  }

  /**
   * Draws top and bottom text onto the canvas with a stroked outline for legibility.
   * @param {CanvasRenderingContext2D} ctx
   * @param {HTMLCanvasElement} canvasElement
   */
  #drawText(ctx, canvasElement) {
    const fontSize = Math.floor(canvasElement.width / 10);
    ctx.font = `bold ${fontSize}px ${this.fontSelect}`;
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = fontSize / 10;

    if (this.topText) {
      ctx.fillText(this.topText, canvasElement.width / 2, fontSize);
      ctx.strokeText(this.topText, canvasElement.width / 2, fontSize);
    }
    if (this.bottomText) {
      ctx.fillText(
        this.bottomText,
        canvasElement.width / 2,
        canvasElement.height - fontSize / 4,
      );
      ctx.strokeText(
        this.bottomText,
        canvasElement.width / 2,
        canvasElement.height - fontSize / 4,
      );
    }
  }
}
