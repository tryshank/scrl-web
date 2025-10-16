import { Button } from "@/components/ui/button";
import { Plus, Layers, Circle, LayoutGrid } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LeftSidebarProps {
  onAddPhoto: () => void;
  onToggleLayers: () => void;
}

export const LeftSidebar = ({ onAddPhoto, onToggleLayers }: LeftSidebarProps) => {
  return (
    <div className="w-[90px] bg-background border-r border-border/40 flex flex-col items-center py-6 gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex flex-col h-auto w-full py-3 gap-2 hover:bg-accent rounded-none"
              onClick={onAddPhoto}
            >
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium">New Layer</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add a new photo layer</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex flex-col h-auto w-full py-3 gap-2 hover:bg-accent rounded-none"
              onClick={onToggleLayers}
            >
              <div className="h-10 w-10 flex items-center justify-center">
                <Layers className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-medium">Layers</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Toggle layers panel</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex flex-col h-auto w-full py-3 gap-2 hover:bg-accent rounded-none opacity-50"
              disabled
            >
              <div className="h-10 w-10 flex items-center justify-center">
                <Circle className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-medium">Background</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Coming soon</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex flex-col h-auto w-full py-3 gap-2 hover:bg-accent rounded-none opacity-50"
              disabled
            >
              <div className="h-10 w-10 flex items-center justify-center border border-border rounded">
                <span className="text-xs font-medium">1:1</span>
              </div>
              <span className="text-[10px] font-medium">Ratio</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Coming soon</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex flex-col h-auto w-full py-3 gap-2 hover:bg-accent rounded-none opacity-50"
              disabled
            >
              <div className="h-10 w-10 flex items-center justify-center">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-medium">Slides</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Coming soon</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
