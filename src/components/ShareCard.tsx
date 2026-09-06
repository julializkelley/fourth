"use client";

import { useEffect, useRef, useState } from "react";

const WIDTH = 1080;
const HEIGHT = 1920;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function drawCard(canvas: HTMLCanvasElement, momName: string, registryUrl: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  await document.fonts.ready;

  const INK = "#1f2430";
  const INK_SOFT = "#2a303f";
  const PARCHMENT = "#f5efe6";
  const CLAY_BRIGHT = "#d98f6b";
  const HIGHLIGHT = "#e8c4a0";
  const LINE = "rgba(245,239,230,0.14)";
  const PAD = 80;
  const CONTENT_WIDTH = WIDTH - PAD * 2;

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Wordmark
  ctx.textBaseline = "alphabetic";
  ctx.font = "500 44px Fraunces, serif";
  ctx.fillStyle = PARCHMENT;
  ctx.fillText("Fourth", PAD, 140);
  const wordmarkWidth = ctx.measureText("Fourth").width;
  ctx.fillStyle = CLAY_BRIGHT;
  ctx.fillText(".", PAD + wordmarkWidth, 140);

  // Headline
  ctx.font = "italic 500 76px Fraunces, serif";
  ctx.fillStyle = PARCHMENT;
  const headlineLines = wrapText(ctx, `I'm helping ${momName} through her fourth trimester`, CONTENT_WIDTH);
  let y = 260;
  for (const line of headlineLines) {
    ctx.fillText(line, PAD, y);
    y += 88;
  }

  // Subhead
  y += 20;
  ctx.font = "italic 500 56px Fraunces, serif";
  ctx.fillStyle = CLAY_BRIGHT;
  ctx.fillText("here's how you can too.", PAD, y);

  // Action card
  const cardY = y + 90;
  const cardHeight = 430;
  ctx.fillStyle = INK_SOFT;
  roundRectPath(ctx, PAD, cardY, CONTENT_WIDTH, cardHeight, 24);
  ctx.fill();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  roundRectPath(ctx, PAD, cardY, CONTENT_WIDTH, cardHeight, 24);
  ctx.stroke();

  const steps = [
    "Pick a meal, an item, or a few hours to help",
    "No account needed — just claim it",
    "Takes about 30 seconds",
  ];
  ctx.font = "400 34px Inter, sans-serif";
  let stepY = cardY + 80;
  for (const step of steps) {
    ctx.fillStyle = CLAY_BRIGHT;
    ctx.fillText("—", PAD + 48, stepY);
    ctx.fillStyle = PARCHMENT;
    const lines = wrapText(ctx, step, CONTENT_WIDTH - 160);
    for (const line of lines) {
      ctx.fillText(line, PAD + 90, stepY);
      stepY += 48;
    }
    stepY += 48;
  }

  // Registry link pill
  const pillY = cardY + cardHeight + 60;
  const pillHeight = 140;
  ctx.fillStyle = INK_SOFT;
  roundRectPath(ctx, PAD, pillY, CONTENT_WIDTH, pillHeight, 16);
  ctx.fill();
  ctx.strokeStyle = HIGHLIGHT;
  roundRectPath(ctx, PAD, pillY, CONTENT_WIDTH, pillHeight, 16);
  ctx.stroke();

  ctx.font = "500 12px 'IBM Plex Mono', monospace";
  ctx.font = "500 22px 'IBM Plex Mono', monospace";
  ctx.fillStyle = HIGHLIGHT;
  ctx.fillText("HER REGISTRY", PAD + 36, pillY + 48);
  ctx.font = "500 30px 'IBM Plex Mono', monospace";
  ctx.fillStyle = PARCHMENT;
  const urlDisplay = registryUrl.replace(/^https?:\/\//, "");
  const urlLines = wrapText(ctx, urlDisplay, CONTENT_WIDTH - 72);
  ctx.fillText(urlLines[0] ?? urlDisplay, PAD + 36, pillY + 92);
}

export function ShareCard({ momName, registryUrl }: { momName: string; registryUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawCard(canvas, momName, registryUrl).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [momName, registryUrl]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "fourth-registry-share.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function copyCaption() {
    const caption = `I'm helping ${momName} through her fourth trimester — here's how you can too: ${registryUrl}`;
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access can fail silently in some browser contexts -- not critical
    }
  }

  return (
    <div className="share-card-block">
      <div className="share-card-preview-wrap">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="share-card-canvas" />
      </div>
      <div className="share-card-actions">
        <button type="button" className="btn btn-primary" onClick={download} disabled={!ready}>
          Download image
        </button>
        <button type="button" className="btn btn-secondary" onClick={copyCaption}>
          {copied ? "Copied!" : "Copy caption"}
        </button>
      </div>
      <p className="form-note">
        Save the image and share it to Instagram or Facebook Stories, or text it directly — paste
        the caption alongside it.
      </p>
    </div>
  );
}
