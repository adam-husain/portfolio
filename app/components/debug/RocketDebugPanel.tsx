"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Types for config
export interface RocketConfig {
  scale: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  arcHeight: number;
  bounceAmplitude: number;
  bounceSpeed: number;
  wobbleSpeed: number;
  rotationOffset: number;
  flameSize: number;
  flameGlow: number;
  boosterOffset3D: number;
  positionSmoothing: number;
  rotationSmoothing: number;
}

interface NumberControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

function NumberControl({ label, value, min, max, step = 0.1, onChange }: NumberControlProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <label className="text-xs text-white/70 w-32 truncate" title={label}>
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1 bg-white/20 rounded appearance-none cursor-pointer accent-primary"
      />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-16 px-1 py-0.5 text-xs bg-white/10 border border-white/20 rounded text-white text-right"
      />
    </div>
  );
}

interface ControlGroupProps {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  matchesSearch: boolean;
}

function ControlGroup({ title, isCollapsed, onToggle, children, matchesSearch }: ControlGroupProps) {
  if (!matchesSearch) return null;

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/5 transition-colors"
      >
        <span>{title}</span>
        <span className="text-white/50">{isCollapsed ? "+" : "-"}</span>
      </button>
      {!isCollapsed && (
        <div className="px-3 pb-2">
          {children}
        </div>
      )}
    </div>
  );
}

interface RocketDebugPanelProps {
  config: RocketConfig;
  onConfigChange: (key: keyof RocketConfig, value: number) => void;
  onReset: () => void;
}

export default function RocketDebugPanel({
  config,
  onConfigChange,
  onReset,
}: RocketDebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Toggle visibility with 'r' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't toggle if user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Drag handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (panelRef.current) {
      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const toggleGroup = useCallback((group: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  }, []);

  const copyConfig = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  }, [config]);

  const matchesSearch = useCallback((text: string) => {
    if (!searchQuery) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  }, [searchQuery]);

  const groupMatchesSearch = useCallback((groupName: string, properties: string[]) => {
    if (!searchQuery) return true;
    if (groupName.toLowerCase().includes(searchQuery.toLowerCase())) return true;
    return properties.some((prop) => prop.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  if (!isVisible) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-[200] bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg shadow-2xl text-white select-none"
      style={{
        left: position.x,
        top: position.y,
        width: 320,
        maxHeight: "80vh",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-white/20 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <span className="text-sm font-semibold">Rocket Debug Panel</span>
        <div className="flex items-center gap-2">
          <button
            onClick={copyConfig}
            className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
            title="Copy config to clipboard"
          >
            Copy
          </button>
          <button
            onClick={onReset}
            className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors"
            title="Reset all to defaults"
          >
            Reset
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
          >
            X
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-white/10">
        <input
          type="text"
          placeholder="Search settings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40"
        />
      </div>

      {/* Controls */}
      <div className="overflow-y-auto" style={{ maxHeight: "calc(80vh - 100px)" }}>
        {/* Position Group */}
        <ControlGroup
          title="Position"
          isCollapsed={collapsedGroups["position"] ?? false}
          onToggle={() => toggleGroup("position")}
          matchesSearch={groupMatchesSearch("Position", ["startX", "startY", "endX", "endY", "arcHeight"])}
        >
          {matchesSearch("startX") && (
            <NumberControl
              label="startX"
              value={config.startX}
              min={-10}
              max={10}
              onChange={(v) => onConfigChange("startX", v)}
            />
          )}
          {matchesSearch("startY") && (
            <NumberControl
              label="startY"
              value={config.startY}
              min={-10}
              max={10}
              onChange={(v) => onConfigChange("startY", v)}
            />
          )}
          {matchesSearch("endX") && (
            <NumberControl
              label="endX"
              value={config.endX}
              min={-10}
              max={10}
              onChange={(v) => onConfigChange("endX", v)}
            />
          )}
          {matchesSearch("endY") && (
            <NumberControl
              label="endY"
              value={config.endY}
              min={-10}
              max={10}
              onChange={(v) => onConfigChange("endY", v)}
            />
          )}
          {matchesSearch("arcHeight") && (
            <NumberControl
              label="arcHeight"
              value={config.arcHeight}
              min={0}
              max={5}
              step={0.1}
              onChange={(v) => onConfigChange("arcHeight", v)}
            />
          )}
        </ControlGroup>

        {/* Scale & Movement Group */}
        <ControlGroup
          title="Scale & Movement"
          isCollapsed={collapsedGroups["movement"] ?? false}
          onToggle={() => toggleGroup("movement")}
          matchesSearch={groupMatchesSearch("Scale & Movement", ["scale", "bounceAmplitude", "bounceSpeed", "wobbleSpeed"])}
        >
          {matchesSearch("scale") && (
            <NumberControl
              label="scale"
              value={config.scale}
              min={0.01}
              max={0.2}
              step={0.005}
              onChange={(v) => onConfigChange("scale", v)}
            />
          )}
          {matchesSearch("bounceAmplitude") && (
            <NumberControl
              label="bounceAmplitude"
              value={config.bounceAmplitude}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => onConfigChange("bounceAmplitude", v)}
            />
          )}
          {matchesSearch("bounceSpeed") && (
            <NumberControl
              label="bounceSpeed"
              value={config.bounceSpeed}
              min={0}
              max={2}
              step={0.05}
              onChange={(v) => onConfigChange("bounceSpeed", v)}
            />
          )}
          {matchesSearch("wobbleSpeed") && (
            <NumberControl
              label="wobbleSpeed"
              value={config.wobbleSpeed}
              min={0}
              max={2}
              step={0.05}
              onChange={(v) => onConfigChange("wobbleSpeed", v)}
            />
          )}
        </ControlGroup>

        {/* Rotation Group */}
        <ControlGroup
          title="Rotation"
          isCollapsed={collapsedGroups["rotation"] ?? false}
          onToggle={() => toggleGroup("rotation")}
          matchesSearch={groupMatchesSearch("Rotation", ["rotationOffset"])}
        >
          {matchesSearch("rotationOffset") && (
            <NumberControl
              label="rotationOffset"
              value={config.rotationOffset}
              min={-Math.PI}
              max={Math.PI}
              step={0.05}
              onChange={(v) => onConfigChange("rotationOffset", v)}
            />
          )}
        </ControlGroup>

        {/* Flame Group */}
        <ControlGroup
          title="Flame"
          isCollapsed={collapsedGroups["flame"] ?? false}
          onToggle={() => toggleGroup("flame")}
          matchesSearch={groupMatchesSearch("Flame", ["flameSize", "flameGlow", "boosterOffset3D"])}
        >
          {matchesSearch("flameSize") && (
            <NumberControl
              label="flameSize"
              value={config.flameSize}
              min={10}
              max={100}
              step={1}
              onChange={(v) => onConfigChange("flameSize", v)}
            />
          )}
          {matchesSearch("flameGlow") && (
            <NumberControl
              label="flameGlow"
              value={config.flameGlow}
              min={10}
              max={100}
              step={1}
              onChange={(v) => onConfigChange("flameGlow", v)}
            />
          )}
          {matchesSearch("boosterOffset3D") && (
            <NumberControl
              label="boosterOffset3D"
              value={config.boosterOffset3D}
              min={0}
              max={2}
              step={0.05}
              onChange={(v) => onConfigChange("boosterOffset3D", v)}
            />
          )}
        </ControlGroup>

        {/* Smoothing Group */}
        <ControlGroup
          title="Smoothing"
          isCollapsed={collapsedGroups["smoothing"] ?? false}
          onToggle={() => toggleGroup("smoothing")}
          matchesSearch={groupMatchesSearch("Smoothing", ["positionSmoothing", "rotationSmoothing"])}
        >
          {matchesSearch("positionSmoothing") && (
            <NumberControl
              label="positionSmoothing"
              value={config.positionSmoothing}
              min={0.01}
              max={1}
              step={0.01}
              onChange={(v) => onConfigChange("positionSmoothing", v)}
            />
          )}
          {matchesSearch("rotationSmoothing") && (
            <NumberControl
              label="rotationSmoothing"
              value={config.rotationSmoothing}
              min={0.01}
              max={1}
              step={0.01}
              onChange={(v) => onConfigChange("rotationSmoothing", v)}
            />
          )}
        </ControlGroup>
      </div>

      {/* Footer */}
      <div className="px-3 py-1 border-t border-white/10 text-xs text-white/40 text-center">
        Press &apos;r&apos; to toggle
      </div>
    </div>
  );
}
