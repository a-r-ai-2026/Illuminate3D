import React, { useRef, useState, useEffect } from "react";

export interface VirtualInputState {
  moveX: number; // -1 to 1
  moveZ: number; // -1 to 1
  isJumping: boolean;
  isInteracting: boolean;
}

interface TouchControlsProps {
  onInputChange: (input: VirtualInputState) => void;
  canInteract: boolean;
  interactLabel?: string;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInputChange,
  canInteract,
  interactLabel = "INTERACT [E]",
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const inputRef = useRef<VirtualInputState>({
    moveX: 0,
    moveZ: 0,
    isJumping: false,
    isInteracting: false,
  });

  const touchIdRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        inputRef.current.moveX = 0;
        inputRef.current.moveZ = 0;
        onInputChange({ ...inputRef.current });
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const maxRadius = rect.width / 2 - 10;

    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    const clampedDist = Math.min(dist, maxRadius);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: knobX, y: knobY });

    // Normalize -1 to 1
    inputRef.current.moveX = knobX / maxRadius;
    inputRef.current.moveZ = knobY / maxRadius;
    onInputChange({ ...inputRef.current });
  };

  const handleJumpPress = (pressed: boolean) => {
    inputRef.current.isJumping = pressed;
    onInputChange({ ...inputRef.current });
  };

  const handleInteractPress = () => {
    inputRef.current.isInteracting = true;
    onInputChange({ ...inputRef.current });
    setTimeout(() => {
      inputRef.current.isInteracting = false;
      onInputChange({ ...inputRef.current });
    }, 150);
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30">
      {/* Virtual Joystick (Bottom Left) */}
      <div className="absolute bottom-20 left-6 sm:bottom-24 sm:left-10 pointer-events-auto">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900/60 border-2 border-amber-400/50 backdrop-blur-md flex items-center justify-center shadow-2xl active:border-amber-300"
          style={{ touchAction: "none" }}
        >
          {/* Inner Deadzone Ring */}
          <div className="w-12 h-12 rounded-full border border-white/20" />

          {/* Draggable Knob */}
          <div
            className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-white shadow-xl transition-transform duration-75 flex items-center justify-center text-slate-950 font-black text-xs"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
          >
            ✦
          </div>
        </div>
        <span className="block text-[10px] text-center font-bold tracking-widest uppercase text-sky-200 mt-1">
          MOVE
        </span>
      </div>

      {/* Action Buttons (Bottom Right) */}
      <div className="absolute bottom-20 right-6 sm:bottom-24 sm:right-10 pointer-events-auto flex items-end gap-3">
        {/* Interact Button */}
        {canInteract && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleInteractPress();
            }}
            onClick={handleInteractPress}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-2xl border-2 border-white flex flex-col items-center justify-center transition-transform active:scale-95 animate-bounce"
            aria-label="Interact button"
          >
            <span className="text-sm sm:text-base leading-none">✨</span>
            <span className="text-[10px] sm:text-xs font-black uppercase mt-1">
              INTERACT
            </span>
          </button>
        )}

        {/* Jump Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handleJumpPress(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleJumpPress(false);
          }}
          onMouseDown={() => handleJumpPress(true)}
          onMouseUp={() => handleJumpPress(false)}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-black text-xs sm:text-sm shadow-2xl border-2 border-white flex flex-col items-center justify-center transition-transform active:scale-90"
          aria-label="Jump button"
        >
          <span className="text-base sm:text-lg leading-none">▲</span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider mt-1">
            JUMP
          </span>
        </button>
      </div>
    </div>
  );
};
