import React, { useRef, useCallback, useState } from 'react';
import type { Overlay, LogoOverlay, TextOverlay } from '../../types';
import { FONT_OPTIONS } from '../../constants';

interface ImageWithOverlaysProps {
  imageUrl: string;
  overlays: Overlay[];
  onOverlaysChange: (overlays: Overlay[]) => void;
  className?: string;
}

const DraggableOverlay: React.FC<{
  overlay: Overlay;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onMove: (id: string, x: number, y: number) => void;
}> = ({ overlay, containerRef, onMove }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const startOx = overlay.x;
      const startOy = overlay.y;

      const onMouseMove = (ev: MouseEvent) => {
        const dx = ((ev.clientX - startX) / rect.width) * 100;
        const dy = ((ev.clientY - startY) / rect.height) * 100;
        const newX = Math.max(0, Math.min(100, startOx + dx));
        const newY = Math.max(0, Math.min(100, startOy + dy));
        onMove(overlay.id, newX, newY);
      };

      const onMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [overlay, containerRef, onMove],
  );

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${overlay.x}%`,
    top: `${overlay.y}%`,
    transform: 'translate(-50%, -50%)',
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 50 : 10,
    userSelect: 'none',
  };

  if (overlay.type === 'logo') {
    const logo = overlay as LogoOverlay;
    return (
      <div
        style={{
          ...style,
          transform: `translate(-50%, -50%) rotate(${logo.rotation}deg)`,
          width: `${logo.size}%`,
        }}
        onMouseDown={handleMouseDown}
        className="hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 rounded transition-shadow"
        title="Glissez pour déplacer le logo"
      >
        <img
          src={logo.url}
          alt="Logo overlay"
          className="w-full h-auto pointer-events-none"
          draggable={false}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
    );
  }

  if (overlay.type === 'text') {
    const txt = overlay as TextOverlay;
    const fontSize = `${txt.fontSize}cqi`;

    return (
      <div
        style={{
          ...style,
          transform: `translate(-50%, -50%) rotate(${txt.rotation}deg) skewX(${txt.skewX}deg) skewY(${txt.skewY}deg) scale(${txt.scale})`,
        }}
        onMouseDown={handleMouseDown}
        className="hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 rounded transition-shadow"
        title="Glissez pour déplacer le texte"
      >
        <span
          style={{
            fontFamily: txt.fontFamily,
            fontSize,
            color: txt.colorHex,
            textShadow: txt.shadow ? '2px 2px 4px rgba(0,0,0,0.6)' : 'none',
            whiteSpace: 'nowrap',
            display: 'inline-block',
            ...(txt.bannerEnabled
              ? {
                  backgroundColor: txt.bannerColorHex,
                  padding: `${txt.bannerPadding * 0.5}em ${txt.bannerPadding}em`,
                  borderRadius: `${txt.bannerBorderRadius}em`,
                }
              : {}),
          }}
          className="pointer-events-none"
        >
          {txt.text}
        </span>
      </div>
    );
  }

  return null;
};

export const ImageWithOverlays: React.FC<ImageWithOverlaysProps> = ({
  imageUrl,
  overlays,
  onOverlaysChange,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (id: string, x: number, y: number) => {
      onOverlaysChange(
        overlays.map((o) => (o.id === id ? { ...o, x, y } : o)),
      );
    },
    [overlays, onOverlaysChange],
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none ${className}`}
      style={{ containerType: 'inline-size' }}
    >
      <img src={imageUrl} alt="Generated" className="w-full h-auto block" draggable={false} />
      {overlays.map((overlay) => (
        <DraggableOverlay
          key={overlay.id}
          overlay={overlay}
          containerRef={containerRef}
          onMove={handleMove}
        />
      ))}
    </div>
  );
};
