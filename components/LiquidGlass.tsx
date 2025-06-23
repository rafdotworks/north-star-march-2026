// Converted to TypeScript React (TSX) with basic types and React DOM usage.
// This file assumes execution inside a React component or app environment.

import React, { useEffect, useRef } from "react";

function smoothStep(a: number, b: number, t: number): number {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function length(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function roundedRectSDF(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): number {
  const qx = Math.abs(x) - width + radius;
  const qy = Math.abs(y) - height + radius;
  return (
    Math.min(Math.max(qx, qy), 0) +
    length(Math.max(qx, 0), Math.max(qy, 0)) -
    radius
  );
}

function texture(x: number, y: number) {
  return { type: "t", x, y };
}

function generateId(): string {
  return "liquid-glass-" + Math.random().toString(36).substr(2, 9);
}

type UV = { x: number; y: number };
type FragmentFunction = (
  uv: UV,
  mouse?: UV
) => { type: string; x: number; y: number };

class Shader {
  width: number;
  height: number;
  fragment: FragmentFunction;
  canvasDPI: number;
  id: string;
  offset: number;
  mouse: UV;
  mouseUsed: boolean;
  container!: HTMLDivElement;
  svg!: SVGSVGElement;
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D | null;
  feImage!: SVGElement;
  feDisplacementMap!: SVGElement;

  constructor(options: {
    width?: number;
    height?: number;
    fragment?: FragmentFunction;
  }) {
    this.width = options.width || 100;
    this.height = options.height || 100;
    this.fragment = options.fragment || ((uv) => texture(uv.x, uv.y));
    this.canvasDPI = 1;
    this.id = generateId();
    this.offset = 10;
    this.mouse = { x: 0, y: 0 };
    this.mouseUsed = false;

    this.createElement();
    this.setupEventListeners();
    this.updateShader();
  }

  createElement() {
    this.container = document.createElement("div");
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${this.width}px;
      height: ${this.height}px;
      overflow: hidden;
      border-radius: 150px;
      box-shadow: 0 8px 32px rgba(255, 255, 255, 0.15), 0 4px 16px rgba(255, 255, 255, 0.1), 0 -4px 16px inset rgba(255, 255, 255, 0.05);
      cursor: grab;
      backdrop-filter: url(#${this.id}_filter) blur(0.25px) contrast(1.1) brightness(1.2) saturate(1.2);
      z-index: 9999;
      pointer-events: auto;
    `;

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", "0");
    this.svg.setAttribute("height", "0");
    this.svg.style.cssText =
      "position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9998;";

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const filter = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "filter"
    );
    filter.setAttribute("id", `${this.id}_filter`);
    filter.setAttribute("filterUnits", "userSpaceOnUse");
    filter.setAttribute("colorInterpolationFilters", "sRGB");
    filter.setAttribute("x", "0");
    filter.setAttribute("y", "0");
    filter.setAttribute("width", this.width.toString());
    filter.setAttribute("height", this.height.toString());

    this.feImage = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feImage"
    );
    this.feImage.setAttribute("id", `${this.id}_map`);
    this.feImage.setAttribute("width", this.width.toString());
    this.feImage.setAttribute("height", this.height.toString());

    this.feDisplacementMap = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feDisplacementMap"
    );
    this.feDisplacementMap.setAttribute("in", "SourceGraphic");
    this.feDisplacementMap.setAttribute("in2", `${this.id}_map`);
    this.feDisplacementMap.setAttribute("xChannelSelector", "R");
    this.feDisplacementMap.setAttribute("yChannelSelector", "G");

    filter.appendChild(this.feImage);
    filter.appendChild(this.feDisplacementMap);
    defs.appendChild(filter);
    this.svg.appendChild(defs);

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width * this.canvasDPI;
    this.canvas.height = this.height * this.canvasDPI;
    this.canvas.style.display = "none";

    this.context = this.canvas.getContext("2d");
  }

  constrainPosition(x: number, y: number) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      x: Math.max(this.offset, Math.min(vw - this.width - this.offset, x)),
      y: Math.max(this.offset, Math.min(vh - this.height - this.offset, y)),
    };
  }

  setupEventListeners() {
    let dragging = false;
    let startX = 0,
      startY = 0,
      initialX = 0,
      initialY = 0;

    this.container.addEventListener("mousedown", (e) => {
      dragging = true;
      this.container.style.cursor = "grabbing";
      startX = e.clientX;
      startY = e.clientY;
      const rect = this.container.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (dragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const newX = initialX + dx;
        const newY = initialY + dy;
        const pos = this.constrainPosition(newX, newY);
        this.container.style.left = pos.x + "px";
        this.container.style.top = pos.y + "px";
        this.container.style.transform = "none";
      }
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) / rect.width;
      this.mouse.y = (e.clientY - rect.top) / rect.height;
      if (this.mouseUsed) this.updateShader();
    });

    document.addEventListener("mouseup", () => {
      dragging = false;
      this.container.style.cursor = "grab";
    });

    window.addEventListener("resize", () => {
      const rect = this.container.getBoundingClientRect();
      const pos = this.constrainPosition(rect.left, rect.top);
      this.container.style.left = pos.x + "px";
      this.container.style.top = pos.y + "px";
      this.container.style.transform = "none";
    });
  }

  updateShader() {
    const w = this.width * this.canvasDPI;
    const h = this.height * this.canvasDPI;
    const data = new Uint8ClampedArray(w * h * 4);

    const proxy = new Proxy(this.mouse, {
      get: (target, prop) => {
        this.mouseUsed = true;
        return target[prop as keyof UV];
      },
    });

    let maxScale = 0;
    const raw: number[] = [];

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % w;
      const y = Math.floor(i / 4 / w);
      const uv = this.fragment({ x: x / w, y: y / h }, proxy);
      const dx = uv.x * w - x;
      const dy = uv.y * h - y;
      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
      raw.push(dx, dy);
    }

    maxScale *= 0.5;

    let idx = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = raw[idx++] / maxScale + 0.5;
      const g = raw[idx++] / maxScale + 0.5;
      data[i] = r * 255;
      data[i + 1] = g * 255;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }

    if (this.context) {
      this.context.putImageData(new ImageData(data, w, h), 0, 0);
      this.feImage.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href",
        this.canvas.toDataURL()
      );
      this.feDisplacementMap.setAttribute(
        "scale",
        (maxScale / this.canvasDPI).toString()
      );
    }
  }

  appendTo(parent: HTMLElement) {
    parent.appendChild(this.svg);
    parent.appendChild(this.container);
  }

  destroy() {
    this.svg.remove();
    this.container.remove();
    this.canvas.remove();
  }
}

export const LiquidGlass: React.FC = () => {
  const shaderRef = useRef<Shader | null>(null);

  useEffect(() => {
    if (!shaderRef.current) {
      shaderRef.current = new Shader({
        width: 300,
        height: 200,
        fragment: (uv, mouse) => {
          const ix = uv.x - 0.5;
          const iy = uv.y - 0.5;
          const dist = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6);
          const disp = smoothStep(0.8, 0, dist - 0.15);
          const scale = smoothStep(0, 1, disp);
          return texture(ix * scale + 0.5, iy * scale + 0.5);
        },
      });

      shaderRef.current.appendTo(document.body);
    }

    return () => {
      if (shaderRef.current) {
        shaderRef.current.destroy();
        shaderRef.current = null;
      }
    };
  }, []);

  return null;
};
