import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, FabricImage, Point, FabricObject, Rect } from "fabric";
import * as FabricAll from "fabric";
import { Button } from "@/components/ui/button";
import { Undo, Redo, Share2, MoreVertical, Plus, ArrowLeft, Upload } from "lucide-react";
import { toast } from "sonner";
import { Toolbar } from "./Toolbar";
import { LeftSidebar } from "./LeftSidebar";
import { LayersPanel } from "./LayersPanel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const CanvasEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showLayers, setShowLayers] = useState(true);
  const [layers, setLayers] = useState<FabricObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const layersRafRef = useRef<number | null>(null);
  const frameSizeRef = useRef({ width: 800, height: 600, gap: 40 });
  const [frames, setFrames] = useState<{ id: string; canvas: HTMLCanvasElement }[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const isDraggingRef = useRef(false);
  const spacePressedRef = useRef(false);
  // Undo/redo disabled – history removed

  const isFrameObject = (o: any) => (o?.data?.type === "frame");
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: "transparent",
    });

    setFabricCanvas(canvas);

    // Initialize first frame to fit viewport height with mobile aspect ratio (9:16)
    const maxHeight = containerHeight - 80; // Leave some padding
    const frameHeight = Math.min(maxHeight, 800); // Cap at reasonable size
    const frameWidth = Math.round(frameHeight * (9 / 16)); // 9:16 mobile aspect ratio
    frameSizeRef.current = { width: frameWidth, height: frameHeight, gap: 40 };
    const firstFrame = new Rect({
      left: 0,
      top: 0,
      width: frameWidth,
      height: frameHeight,
      fill: "#ffffff",
      selectable: false,
      evented: false,
      data: { type: "frame", id: "frame-1" },
    });
    canvas.add(firstFrame);
    canvas.sendObjectToBack(firstFrame);

    // Center viewport on the first frame so the scene isn't stuck to screen edges
    const initZoom = canvas.getZoom();
    const initVpt = canvas.viewportTransform || [initZoom, 0, 0, initZoom, 0, 0];
    const initCenterX = (firstFrame.left || 0) + (firstFrame.width || 0) / 2;
    const initCenterY = (firstFrame.top || 0) + (firstFrame.height || 0) / 2;
    initVpt[4] = canvas.getWidth() / 2 - initCenterX * initZoom;
    initVpt[5] = canvas.getHeight() / 2 - initCenterY * initZoom;
    canvas.setViewportTransform(initVpt);
    canvas.requestRenderAll();
    // No initial snapshot – history disabled

    // Track selection changes
    canvas.on("selection:created", (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on("selection:updated", (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    // Track object changes to update layers (exclude frames), throttled via rAF
    const updateLayers = () => {
      if (layersRafRef.current) cancelAnimationFrame(layersRafRef.current);
      layersRafRef.current = requestAnimationFrame(() => {
        setLayers([...canvas.getObjects().filter((o) => (o as any).data?.type !== "frame")]);
        layersRafRef.current = null;
      });
    };

    canvas.on("object:added", updateLayers);
    canvas.on("object:removed", updateLayers);
    canvas.on("object:modified", updateLayers);

    const SNAP_THRESHOLD = 10;
    let isSnapping = false;
    
    canvas.on("object:moving", (e) => {
      isSnapping = false;
      const obj = e.target;
      if (!obj) return;

      const canvasObjects = canvas.getObjects();
      const objBound = obj.getBoundingRect();

      // Removed snapping to canvas edges to allow an unbounded scene


      // Check snapping to other objects (only if not already snapping to canvas)
      if (!isSnapping) {
        canvasObjects.forEach((otherObj) => {
          if (otherObj === obj || isSnapping) return;

          const otherBound = otherObj.getBoundingRect();

          // Snap to left edge
          if (Math.abs(objBound.left - otherBound.left) < SNAP_THRESHOLD) {
            obj.set({ left: obj.left! + (otherBound.left - objBound.left) });
            isSnapping = true;
          }
          // Snap to right edge
          if (!isSnapping && Math.abs(objBound.left + objBound.width - (otherBound.left + otherBound.width)) < SNAP_THRESHOLD) {
            obj.set({ left: obj.left! + ((otherBound.left + otherBound.width) - (objBound.left + objBound.width)) });
            isSnapping = true;
          }
          // Snap to top edge
          if (!isSnapping && Math.abs(objBound.top - otherBound.top) < SNAP_THRESHOLD) {
            obj.set({ top: obj.top! + (otherBound.top - objBound.top) });
            isSnapping = true;
          }
          // Snap to bottom edge
          if (!isSnapping && Math.abs(objBound.top + objBound.height - (otherBound.top + otherBound.height)) < SNAP_THRESHOLD) {
            obj.set({ top: obj.top! + ((otherBound.top + otherBound.height) - (objBound.top + objBound.height)) });
            isSnapping = true;
          }
        });
      }
    });

    // Handle zoom with mouse wheel via Fabric event
    const handleWheelFabric = (opt: any) => {
      const e = opt.e as WheelEvent;
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY;
      let newZoom = canvas.getZoom();
      newZoom *= 0.999 ** delta;

      if (newZoom > 4) newZoom = 4;
      if (newZoom < 0.1) newZoom = 0.1;

      const point = new Point(e.offsetX, e.offsetY);
      canvas.zoomToPoint(point, newZoom);
      setZoom(newZoom);
      canvas.requestRenderAll();
    };

    canvas.on("mouse:wheel", handleWheelFabric);

    // Handle panning with middle mouse or space+drag
    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;

    canvas.on("mouse:down", (opt) => {
      const evt = opt.e as MouseEvent;
      const shouldPan = evt.button === 1 || evt.button === 2 || (evt.button === 0 && (evt.shiftKey || spacePressedRef.current || !opt.target));
      if (shouldPan) {
        // Middle mouse, Right mouse, Shift+Left, Space+Left, or dragging empty space
        isPanning = true;
        canvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
        canvas.setCursor("grab");
      }
    });

    canvas.on("mouse:move", (opt) => {
      if (isPanning) {
        const evt = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] += evt.clientX - lastPosX;
          vpt[5] += evt.clientY - lastPosY;
          canvas.requestRenderAll();
          lastPosX = evt.clientX;
          lastPosY = evt.clientY;
        }
      }
    });

    canvas.on("mouse:up", () => {
      isPanning = false;
      canvas.selection = true;
      canvas.setCursor("default");
    });

    // Deselect when clicking on empty space
    canvas.on("mouse:down", (opt) => {
      if (!opt.target && !isPanning) {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    });

    return () => {
      canvas.off("mouse:wheel", handleWheelFabric);
      if (layersRafRef.current) {
        cancelAnimationFrame(layersRafRef.current);
        layersRafRef.current = null;
      }
      canvas.dispose();
    };
  }, []);

  // Global spacebar panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        spacePressedRef.current = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spacePressedRef.current = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !fabricCanvas) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imgUrl = e.target?.result as string;
        FabricImage.fromURL(imgUrl).then((img) => {
          // Scale image to reasonable size
          const maxSize = 300;
          const scale = Math.min(maxSize / img.width!, maxSize / img.height!);
          img.scale(scale);

          // Position in center of active (last) frame
          const frameObjs = fabricCanvas.getObjects().filter((o) => (o as any).data?.type === "frame");
          const activeFrame: any = frameObjs[frameObjs.length - 1];
          const frameLeft = activeFrame?.left || 0;
          const frameTop = activeFrame?.top || 0;
          const frameW = activeFrame?.width || fabricCanvas.width!;
          const frameH = activeFrame?.height || fabricCanvas.height!;
          img.set({
            left: frameLeft + frameW / 2 - (img.width! * scale) / 2,
            top: frameTop + frameH / 2 - (img.height! * scale) / 2,
          });

          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.requestRenderAll();
          toast.success("Image added to canvas");
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    event.target.value = "";
  };

  const handleDelete = () => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.remove(selectedObject);
    toast.success("Object deleted");
  };

  const handleDuplicate = () => {
    if (!fabricCanvas || !selectedObject) return;
    selectedObject.clone().then((cloned: FabricObject) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      });
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.requestRenderAll();
      toast.success("Object duplicated");
    });
  };

  const handleLock = () => {
    if (!selectedObject || !fabricCanvas) return;
    const isLocked = selectedObject.lockMovementX;
    selectedObject.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockRotation: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
    });
    fabricCanvas.requestRenderAll();
    if (layersRafRef.current) cancelAnimationFrame(layersRafRef.current);
    layersRafRef.current = requestAnimationFrame(() => {
      setLayers([...fabricCanvas.getObjects().filter((o) => (o as any).data?.type !== "frame")]);
      layersRafRef.current = null;
    });
    toast.success(isLocked ? "Object unlocked" : "Object locked");
  };

  const handleDeselect = () => {
    if (!fabricCanvas) return;
    fabricCanvas.discardActiveObject();
    fabricCanvas.requestRenderAll();
  };

  const handleSelectLayer = (layer: FabricObject) => {
    if (!fabricCanvas) return;
    fabricCanvas.setActiveObject(layer);
    fabricCanvas.requestRenderAll();
  };

  const handleToggleVisibility = (layer: FabricObject) => {
    if (!fabricCanvas) return;
    layer.visible = !layer.visible;
    fabricCanvas.requestRenderAll();
    if (layersRafRef.current) cancelAnimationFrame(layersRafRef.current);
    layersRafRef.current = requestAnimationFrame(() => {
      setLayers([...fabricCanvas.getObjects().filter((o) => (o as any).data?.type !== "frame")]);
      layersRafRef.current = null;
    });
  };

  const handleBringForward = () => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.bringObjectForward(selectedObject);
    fabricCanvas.requestRenderAll();
    if (layersRafRef.current) cancelAnimationFrame(layersRafRef.current);
    layersRafRef.current = requestAnimationFrame(() => {
      setLayers([...fabricCanvas.getObjects().filter((o) => (o as any).data?.type !== "frame")]);
      layersRafRef.current = null;
    });
    toast.success("Moved forward");
  };

  const handleSendBackward = () => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.sendObjectBackwards(selectedObject);
    // Prevent sending behind frames
    const objs = fabricCanvas.getObjects();
    const frameMaxIndex = Math.max(
      -1,
      ...objs.map((o, i) => (((o as any).data?.type === "frame") ? i : -1))
    );
    let idx = objs.indexOf(selectedObject);
    let safety = 0;
    while (idx <= frameMaxIndex && safety < 50) {
      fabricCanvas.bringObjectForward(selectedObject);
      idx = objs.indexOf(selectedObject);
      safety++;
    }
    fabricCanvas.requestRenderAll();
    if (layersRafRef.current) cancelAnimationFrame(layersRafRef.current);
    layersRafRef.current = requestAnimationFrame(() => {
      setLayers([...fabricCanvas.getObjects().filter((o) => (o as any).data?.type !== "frame")]);
      layersRafRef.current = null;
    });
    toast.success("Moved backward");
  };

  // Drag and drop functionality
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = false;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = false;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0 || !fabricCanvas) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please drop image files only");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;
        FabricImage.fromURL(imgUrl).then((img) => {
          const maxSize = 300;
          const scale = Math.min(maxSize / img.width!, maxSize / img.height!);
          img.scale(scale);

          const frameObjs = fabricCanvas.getObjects().filter((o) => (o as any).data?.type === "frame");
          const activeFrame: any = frameObjs[frameObjs.length - 1];
          const frameLeft = activeFrame?.left || 0;
          const frameTop = activeFrame?.top || 0;
          const frameW = activeFrame?.width || fabricCanvas.width!;
          const frameH = activeFrame?.height || fabricCanvas.height!;
          img.set({
            left: frameLeft + frameW / 2 - (img.width! * scale) / 2,
            top: frameTop + frameH / 2 - (img.height! * scale) / 2,
          });

          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.requestRenderAll();
          toast.success("Image added to canvas");
        });
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Top Header - Full Width */}
      <div className="h-12 bg-background flex items-center justify-between px-6 border-b border-border w-full shrink-0">
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDeselect}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Back</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              disabled
            >
              <Undo className="h-4 w-4" />
            </Button>
            {/* removed frame counters since undo/redo is not tied to frames */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              disabled
            >
              <Redo className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-2" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload image</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Coming soon</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>More options</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

      {/* Main Content Area with Sidebars */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar 
          onAddPhoto={() => fileInputRef.current?.click()} 
          onToggleLayers={() => setShowLayers(!showLayers)}
        />

        {/* Canvas Container */}
        <div className="flex-1 flex flex-col min-w-0">
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden relative w-full h-full"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <canvas ref={canvasRef} className="shadow-2xl" />
          </div>
          {isDraggingRef.current && (
            <div className="absolute inset-0 border-4 border-dashed border-primary bg-primary/10 flex items-center justify-center pointer-events-none">
              <p className="text-2xl font-semibold">Drop images here</p>
            </div>
          )}
          
          {/* Zoom indicator */}
          <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 text-xs font-medium">
            {Math.round(zoom * 100)}%
          </div>
          
          {/* Add frame button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    if (!fabricCanvas || !containerRef.current) return;
                    const { width: frameW, height: frameH, gap } = frameSizeRef.current;
                    // Count existing frames
                    const frames = fabricCanvas
                      .getObjects()
                      .filter((o) => (o as any).data?.type === "frame");
                    const left = frames.length * (frameW + gap);
                    // Don't expand canvas - frames exist in infinite space; pan to new frame
                    const newFrame = new Rect({
                      left,
                      top: 0,
                      width: frameW,
                      height: frameH,
                      fill: "#ffffff",
                      selectable: false,
                      evented: false,
                      data: { type: "frame", id: `frame-${Date.now()}` },
                    });
                    fabricCanvas.add(newFrame);
                    fabricCanvas.sendObjectToBack(newFrame);

                    // Center viewport on the newly created frame
                    const centerX = left + frameW / 2;
                    const centerY = 0 + frameH / 2;
                    const z = fabricCanvas.getZoom();
                    const vpt = fabricCanvas.viewportTransform || [z, 0, 0, z, 0, 0];
                    vpt[4] = fabricCanvas.getWidth() / 2 - centerX * z;
                    vpt[5] = fabricCanvas.getHeight() / 2 - centerY * z;
                    fabricCanvas.setViewportTransform(vpt);

                    fabricCanvas.requestRenderAll();
                    toast.success("New frame created");
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg"
                  size="icon"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add new frame</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          </div>

          {/* Toolbar - Always visible at bottom */}
          <Toolbar
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onLock={handleLock}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
            hasSelection={!!selectedObject}
            onClose={handleDeselect}
          />
        </div>

        {/* Right Layers Panel */}
        {showLayers && (
          <LayersPanel
            layers={layers}
            onClose={() => setShowLayers(false)}
            onSelectLayer={handleSelectLayer}
            selectedLayer={selectedObject}
            onToggleVisibility={handleToggleVisibility}
          />
        )}
      </div>
    </div>
  );
};
