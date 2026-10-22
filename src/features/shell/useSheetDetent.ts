import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type SheetDetent = "peek" | "half" | "full";

const SNAP = 48;

/**
 * Peek / half / full sheet, with drag-to-snap on the grabber.
 * Dragging down shrinks the sheet; dragging up expands it.
 */
export function useSheetDetent(initial: SheetDetent = "half") {
  const [detent, setDetent] = useState<SheetDetent>(initial);
  const [dragY, setDragY] = useState(0);
  const dragging = useRef(false);
  const originY = useRef(0);
  const skipClick = useRef(false);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    dragging.current = true;
    skipClick.current = false;
    originY.current = e.clientY;
    setDragY(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    const dy = e.clientY - originY.current;
    if (Math.abs(dy) > 10) skipClick.current = true;
    setDragY(dy);
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    setDragY((dy) => {
      if (dy > SNAP) {
        setDetent((d) => (d === "full" ? "half" : "peek"));
      } else if (dy < -SNAP) {
        setDetent((d) => (d === "peek" ? "half" : "full"));
      }
      return 0;
    });
  }, []);

  const consumeClick = useCallback(() => {
    if (skipClick.current) {
      skipClick.current = false;
      return true;
    }
    return false;
  }, []);

  return {
    detent,
    setDetent,
    dragY,
    consumeClick,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
