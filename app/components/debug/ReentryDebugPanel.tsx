"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Types for config
export interface ReentryConfig {
  sectionHeight: string;
  asteroidCount: number;
  asteroidScaleRange: [number, number];
  balloonScale: number;
  balloonStartX: number;
  balloonStartY: number;
  balloonEndX: number;
  balloonEndY: number;
  balloonWobbleSpeed: number;
  balloonWobbleAmount: number;
  textStart: number;
  textEnd: number;
}

export interface AsteroidPath {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
  scale: number;
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

interface TextControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function TextControl({ label, value, onChange }: TextControlProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <label className="text-xs text-white/70 w-32 truncate" title={label}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-2 py-0.5 text-xs bg-white/10 border border-white/20 rounded text-white"
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

interface ReentryDebugPanelProps {
  config: ReentryConfig;
  asteroidPaths: AsteroidPath[];
  onConfigChange: (key: keyof ReentryConfig, value: number | string) => void;
  onAsteroidPathChange: (index: number, key: keyof AsteroidPath, value: number) => void;
  onReset: () => void;
  onExpandedAsteroidsChange?: (indices: number[]) => void;
  onBalloonExpandedChange?: (expanded: boolean) => void;
}

export default function ReentryDebugPanel({
  config,
  asteroidPaths,
  onConfigChange,
  onAsteroidPathChange,
  onReset,
  onExpandedAsteroidsChange,
  onBalloonExpandedChange,
}: ReentryDebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Report expanded asteroid indices when they change
  useEffect(() => {
    if (!onExpandedAsteroidsChange || !isVisible) {
      onExpandedAsteroidsChange?.([]);
      return;
    }

    const expandedIndices: number[] = [];
    asteroidPaths.forEach((_, index) => {
      const isCollapsed = collapsedGroups[`asteroid-${index}`] ?? true;
      if (!isCollapsed) {
        expandedIndices.push(index);
      }
    });
    onExpandedAsteroidsChange(expandedIndices);
  }, [collapsedGroups, asteroidPaths, onExpandedAsteroidsChange, isVisible]);

  // Report balloon expanded state when it changes
  useEffect(() => {
    if (!onBalloonExpandedChange || !isVisible) {
      onBalloonExpandedChange?.(false);
      return;
    }

    const isBalloonExpanded = !(collapsedGroups["balloon"] ?? true);
    onBalloonExpandedChange(isBalloonExpanded);
  }, [collapsedGroups, onBalloonExpandedChange, isVisible]);

  // Toggle visibility with 'd' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "d" && !e.ctrlKey && !e.metaKey && !e.altKey) {
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
    const exportData = {
      config,
      asteroidPaths,
    };
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
  }, [config, asteroidPaths]);

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
        <span className="text-sm font-semibold">Reentry Debug Panel</span>
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
        {/* Section Group */}
        <ControlGroup
          title="Section"
          isCollapsed={collapsedGroups["section"] ?? false}
          onToggle={() => toggleGroup("section")}
          matchesSearch={groupMatchesSearch("Section", ["sectionHeight"])}
        >
          {matchesSearch("sectionHeight") && (
            <TextControl
              label="sectionHeight"
              value={config.sectionHeight}
              onChange={(v) => onConfigChange("sectionHeight", v)}
            />
          )}
        </ControlGroup>

        {/* Asteroid Groups */}
        {asteroidPaths.map((path, index) => (
          <ControlGroup
            key={index}
            title={`Asteroid ${index + 1}`}
            isCollapsed={collapsedGroups[`asteroid-${index}`] ?? true}
            onToggle={() => toggleGroup(`asteroid-${index}`)}
            matchesSearch={groupMatchesSearch(`Asteroid ${index + 1}`, [
              "startX", "startY", "endX", "endY", "delay", "scale"
            ])}
          >
            {matchesSearch("startX") && (
              <NumberControl
                label="startX"
                value={path.startX}
                min={-10}
                max={10}
                onChange={(v) => onAsteroidPathChange(index, "startX", v)}
              />
            )}
            {matchesSearch("startY") && (
              <NumberControl
                label="startY"
                value={path.startY}
                min={-10}
                max={10}
                onChange={(v) => onAsteroidPathChange(index, "startY", v)}
              />
            )}
            {matchesSearch("endX") && (
              <NumberControl
                label="endX"
                value={path.endX}
                min={-10}
                max={10}
                onChange={(v) => onAsteroidPathChange(index, "endX", v)}
              />
            )}
            {matchesSearch("endY") && (
              <NumberControl
                label="endY"
                value={path.endY}
                min={-10}
                max={10}
                onChange={(v) => onAsteroidPathChange(index, "endY", v)}
              />
            )}
            {matchesSearch("delay") && (
              <NumberControl
                label="delay"
                value={path.delay}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => onAsteroidPathChange(index, "delay", v)}
              />
            )}
            {matchesSearch("scale") && (
              <NumberControl
                label="scale"
                value={path.scale}
                min={0.1}
                max={1}
                step={0.05}
                onChange={(v) => onAsteroidPathChange(index, "scale", v)}
              />
            )}
          </ControlGroup>
        ))}

        {/* Balloon Group */}
        <ControlGroup
          title="Balloon"
          isCollapsed={collapsedGroups["balloon"] ?? true}
          onToggle={() => toggleGroup("balloon")}
          matchesSearch={groupMatchesSearch("Balloon", [
            "balloonScale", "balloonStartX", "balloonStartY", "balloonEndX", "balloonEndY",
            "balloonWobbleSpeed", "balloonWobbleAmount"
          ])}
        >
          {matchesSearch("balloonScale") && (
            <NumberControl
              label="balloonScale"
              value={config.balloonScale}
              min={0.1}
              max={3}
              onChange={(v) => onConfigChange("balloonScale", v)}
            />
          )}
          {matchesSearch("balloonStartX") && (
            <NumberControl
              label="balloonStartX"
              value={config.balloonStartX}
              min={-20}
              max={20}
              onChange={(v) => onConfigChange("balloonStartX", v)}
            />
          )}
          {matchesSearch("balloonStartY") && (
            <NumberControl
              label="balloonStartY"
              value={config.balloonStartY}
              min={-20}
              max={20}
              onChange={(v) => onConfigChange("balloonStartY", v)}
            />
          )}
          {matchesSearch("balloonEndX") && (
            <NumberControl
              label="balloonEndX"
              value={config.balloonEndX}
              min={-20}
              max={20}
              onChange={(v) => onConfigChange("balloonEndX", v)}
            />
          )}
          {matchesSearch("balloonEndY") && (
            <NumberControl
              label="balloonEndY"
              value={config.balloonEndY}
              min={-20}
              max={20}
              onChange={(v) => onConfigChange("balloonEndY", v)}
            />
          )}
          {matchesSearch("balloonWobbleSpeed") && (
            <NumberControl
              label="balloonWobbleSpeed"
              value={config.balloonWobbleSpeed}
              min={0}
              max={5}
              onChange={(v) => onConfigChange("balloonWobbleSpeed", v)}
            />
          )}
          {matchesSearch("balloonWobbleAmount") && (
            <NumberControl
              label="balloonWobbleAmount"
              value={config.balloonWobbleAmount}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => onConfigChange("balloonWobbleAmount", v)}
            />
          )}
        </ControlGroup>

        {/* Text Timing Group */}
        <ControlGroup
          title="Text Timing"
          isCollapsed={collapsedGroups["text"] ?? false}
          onToggle={() => toggleGroup("text")}
          matchesSearch={groupMatchesSearch("Text Timing", ["textStart", "textEnd"])}
        >
          {matchesSearch("textStart") && (
            <NumberControl
              label="textStart"
              value={config.textStart}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => onConfigChange("textStart", v)}
            />
          )}
          {matchesSearch("textEnd") && (
            <NumberControl
              label="textEnd"
              value={config.textEnd}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => onConfigChange("textEnd", v)}
            />
          )}
        </ControlGroup>
      </div>

      {/* Footer */}
      <div className="px-3 py-1 border-t border-white/10 text-xs text-white/40 text-center">
        Press &apos;d&apos; to toggle
      </div>
    </div>
  );
}
