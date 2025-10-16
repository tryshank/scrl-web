import { Button } from "@/components/ui/button";
import { X, Eye, EyeOff, Lock } from "lucide-react";
import { FabricObject } from "fabric";

interface LayersPanelProps {
  layers: FabricObject[];
  onClose: () => void;
  onSelectLayer: (layer: FabricObject) => void;
  selectedLayer?: FabricObject | null;
  onToggleVisibility: (layer: FabricObject) => void;
}

export const LayersPanel = ({ layers, onClose, onSelectLayer, selectedLayer, onToggleVisibility }: LayersPanelProps) => {
  return (
    <div className="w-[380px] bg-background border-l border-border/40 flex flex-col">
      <div className="flex items-center justify-center px-4 py-4 relative">
        <h2 className="text-xs font-medium uppercase tracking-wider">Layers</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 absolute right-2">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        {layers.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-12">No layers yet</p>
        ) : (
          <div className="space-y-2">
            {layers.map((layer, index) => {
              const isSelected = selectedLayer === layer;
              const isLocked = layer.lockMovementX || false;
              const isVisible = layer.visible !== false;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer ${
                    isSelected ? "bg-accent" : ""
                  }`}
                  onClick={() => onSelectLayer(layer)}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 p-0 hover:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(layer);
                    }}
                  >
                    {isVisible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4 opacity-40" />
                    )}
                  </Button>
                  
                  {layer.type === "image" ? (
                    <div className="h-10 w-10 rounded border border-border overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={(layer as any)._element?.src || ""} 
                        alt="Layer thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded border border-border bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">T</span>
                    </div>
                  )}
                  
                  <div 
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm truncate">
                      {layer.type === "image" ? "Image" : layer.type} {layers.length - index}
                    </p>
                  </div>
                  
                  {isLocked && (
                    <Lock className="h-4 w-4 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
