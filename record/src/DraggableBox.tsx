import React, { useEffect, useRef, useState } from "react";

const DraggableBox = ({ overlayRef }: { overlayRef: React.RefObject<HTMLCanvasElement | null> }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const isClicked = useRef<boolean>(false);

  const coords = useRef<{
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
  }>({
    startX: 0,
    startY: 0,
    lastX: 180, // Initial left position
    lastY: 120, // Initial top position
  });

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isClicked.current = true;
    coords.current.startX = e.clientX;
    coords.current.startY = e.clientY;
  };

  const onMouseUp = () => {
    isClicked.current = false;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isClicked.current) return;

    const nextX = coords.current.lastX + (e.clientX - coords.current.startX);
    const nextY = coords.current.lastY + (e.clientY - coords.current.startY);

    // Get the boundaries of the snapshot area
    const snapshotBounds = overlayRef.current!.getBoundingClientRect();

    // Limit the ball position to stay within the snapshot area
    const clampedX = Math.min(Math.max(nextX, snapshotBounds.left), snapshotBounds.right - boxRef.current!.offsetWidth);
    const clampedY = Math.min(Math.max(nextY, snapshotBounds.top), snapshotBounds.bottom - boxRef.current!.offsetHeight);

    boxRef.current!.style.top = `${clampedY}px`;
    boxRef.current!.style.left = `${clampedX}px`;

    coords.current.lastX = clampedX;
    coords.current.lastY = clampedY;
  };

  useEffect(() => {
    const box = boxRef.current;

    box?.addEventListener("mousedown", onMouseDown);

    return () => {
      box?.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div
      className="draggable-circle"
      ref={boxRef}
      style={{
        position: "absolute",
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        background: "red",
        zIndex: 102,
        cursor: "grab",
        top: `${coords.current.lastY}px`,
        left: `${coords.current.lastX}px`,
      }}
    ></div>
  );
};

export default DraggableBox;