import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Copy, 
  Lock, 
  FlipHorizontal, 
  Layers3, 
  Palette,
  Type,
  Move,
  Maximize2,
  X
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolbarProps {
  onDelete?: () => void;
  onDuplicate?: () => void;
  onLock?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  hasSelection: boolean;
  onClose?: () => void;
}

export const Toolbar = ({
  onDelete,
  onDuplicate,
  onLock,
  onBringForward,
  onSendBackward,
  hasSelection,
  onClose,
}: ToolbarProps) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl px-3 py-2">
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-10 w-10 hover:bg-accent"
                disabled={!hasSelection}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Trash2 className="h-4 w-4" />
                  <span className="text-[9px]">Delete</span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete object</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-accent opacity-50"
                disabled
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Maximize2 className="h-4 w-4" />
                  <span className="text-[9px]">Crop</span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Coming soon</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-accent opacity-50"
                disabled
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Layers3 className="h-4 w-4" />
                  <span className="text-[9px]">Arrange</span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Coming soon</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-accent opacity-50"
                disabled
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Palette className="h-4 w-4" />
                  <span className="text-[9px]">Fill</span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Coming soon</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-accent opacity-50"
                disabled
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Type className="h-4 w-4" />
                  <span className="text-[9px]">Style</span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Coming soon</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDuplicate}
                className="h-10 w-10 hover:bg-accent"
                disabled={!hasSelection}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Copy className="h-4 w-4" />
                  <span className="text-[9px]">Duplicate</span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate object</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-accent opacity-50"
                disabled
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Move className="h-4 w-4" />
                  <span className="text-[9px]">Nudge</span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Coming soon</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-accent opacity-50"
                disabled
              >
                <div className="flex flex-col items-center gap-0.5">
                  <FlipHorizontal className="h-4 w-4" />
                  <span className="text-[9px]">Flip</span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Coming soon</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-accent opacity-50"
                disabled
              >
                <div className="flex flex-col items-center gap-0.5">
                  <X className="h-4 w-4" />
                  <span className="text-[9px]">Clear</span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Coming soon</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLock}
                className="h-10 w-10 hover:bg-accent"
                disabled={!hasSelection}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Lock className="h-4 w-4" />
                  <span className="text-[9px]">Lock</span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Lock/unlock object</TooltipContent>
          </Tooltip>

          <div className="w-px h-8 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-accent"
                onClick={onClose}
                disabled={!hasSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close toolbar</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
