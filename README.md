# scrl-web

A web-based canvas editor for creating photo collages, inspired by the SCRL mobile apps. Built as a technical assignment to demonstrate core canvas functionality on desktop.

## What it does

- Zoomable/scrollable workspace with a white canvas slide
- Upload photos and drop them onto the canvas
- Move, rotate, and resize images with handles
- Layer management (reorder, lock, hide)
- Basic arrange tools (bring forward/send backward)

Basically a simplified version of what you'd find in the SCRL iOS/Android apps, but for desktop browsers.

## Running it

```bash
# install deps (using pnpm)
pnpm install

# start dev server
pnpm dev
```

Then open localhost in your browser and start dragging images around.

## Tech

React + TypeScript + Vite + Fabric.js for canvas stuff + Tailwind for styling
