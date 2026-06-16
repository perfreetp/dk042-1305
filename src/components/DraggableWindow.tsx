import { useState, useRef, useCallback, useEffect } from 'react';
import { Minus, Maximize2, X, ChevronUp } from 'lucide-react';
import type { WindowKey } from '../types';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/helpers';

interface DraggableWindowProps {
  id: WindowKey;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number; width: number; height: number };
}

export function DraggableWindow({ id, title, icon, children }: DraggableWindowProps) {
  const windowPos = useAppStore((state) => state.windowPositions[id]);
  const updateWindowPosition = useAppStore((state) => state.updateWindowPosition);
  const bringWindowToFront = useAppStore((state) => state.bringWindowToFront);
  const minimizeWindow = useAppStore((state) => state.minimizeWindow);
  const maximizeWindow = useAppStore((state) => state.maximizeWindow);
  const restoreWindow = useAppStore((state) => state.restoreWindow);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const headerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('.window-header-drag')) {
        return;
      }
      e.preventDefault();
      setIsDragging(true);
      bringWindowToFront(id);
      setDragOffset({
        x: e.clientX - windowPos.x,
        y: e.clientY - windowPos.y,
      });
    },
    [id, windowPos.x, windowPos.y, bringWindowToFront]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragOffset.y));
      updateWindowPosition(id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, id, updateWindowPosition]);

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    minimizeWindow(id);
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    maximizeWindow(id);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    minimizeWindow(id);
  };

  const handleRestore = () => {
    restoreWindow(id);
    bringWindowToFront(id);
  };

  if (windowPos.isMinimized) {
    return (
      <div
        className="fixed bottom-4 left-4 flex items-center gap-2 bg-bg-secondary border border-border-default px-4 py-2 cursor-pointer hover:border-alert-orange transition-all z-50"
        onClick={handleRestore}
      >
        <div className="text-alert-orange">{icon}</div>
        <span className="text-text-primary font-medium text-sm">{title}</span>
        <ChevronUp className="w-4 h-4 text-text-secondary" />
      </div>
    );
  }

  const style = windowPos.isMaximized
    ? {
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        zIndex: windowPos.zIndex,
      }
    : {
        left: windowPos.x,
        top: windowPos.y,
        width: windowPos.width,
        height: windowPos.height,
        zIndex: windowPos.zIndex,
      };

  return (
    <div
      className={cn(
        'window-container transition-shadow duration-200',
        isDragging && 'shadow-glow',
        'animate-fade-in'
      )}
      style={style}
      onMouseDown={() => bringWindowToFront(id)}
    >
      <div
        ref={headerRef}
        className="window-header window-header-drag"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="text-alert-orange">{icon}</div>
          <h3 className="font-semibold text-text-primary text-sm tracking-wide">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleMinimize}
            className="p-1 hover:bg-bg-tertiary rounded transition-colors"
            title="最小化"
          >
            <Minus className="w-4 h-4 text-text-secondary" />
          </button>
          <button
            onClick={handleMaximize}
            className="p-1 hover:bg-bg-tertiary rounded transition-colors"
            title="最大化"
          >
            <Maximize2 className="w-4 h-4 text-text-secondary" />
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-alert-red/20 rounded transition-colors group"
            title="关闭"
          >
            <X className="w-4 h-4 text-text-secondary group-hover:text-alert-red" />
          </button>
        </div>
      </div>
      <div className="window-content">{children}</div>
    </div>
  );
}
