import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Line, Circle, G } from 'react-native-svg';

export type BannerPattern = 'sacred' | 'grid' | 'waveform';

interface GeometricBannerProps {
  pattern: BannerPattern;
  color: string;
  width?: number;
  height?: number;
}

/**
 * Sacred Geometry Pattern
 * Interlocking circles forming a flower-of-life inspired design
 */
const SacredGeometryPattern: React.FC<{ color: string; width: number; height: number }> = ({ 
  color, 
  width, 
  height 
}) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = height * 0.35;
  const smallRadius = radius * 0.5;
  
  // Create 6 circles around center point (hexagonal arrangement)
  const circles = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * (Math.PI / 180);
    const cx = centerX + Math.cos(angle) * smallRadius;
    const cy = centerY + Math.sin(angle) * smallRadius;
    circles.push({ cx, cy });
  }
  
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Center circle */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={smallRadius}
        stroke={color}
        strokeWidth={1}
        fill="none"
        opacity={0.6}
      />
      
      {/* Surrounding circles */}
      {circles.map((circle, index) => (
        <Circle
          key={index}
          cx={circle.cx}
          cy={circle.cy}
          r={smallRadius}
          stroke={color}
          strokeWidth={1}
          fill="none"
          opacity={0.4}
        />
      ))}
      
      {/* Outer hexagon connecting lines */}
      <G opacity={0.3}>
        {circles.map((circle, index) => {
          const nextCircle = circles[(index + 1) % 6];
          return (
            <Line
              key={`line-${index}`}
              x1={circle.cx}
              y1={circle.cy}
              x2={nextCircle.cx}
              y2={nextCircle.cy}
              stroke={color}
              strokeWidth={0.5}
            />
          );
        })}
      </G>
      
      {/* Radial lines from center */}
      <G opacity={0.25}>
        {circles.map((circle, index) => (
          <Line
            key={`radial-${index}`}
            x1={centerX}
            y1={centerY}
            x2={circle.cx}
            y2={circle.cy}
            stroke={color}
            strokeWidth={0.5}
          />
        ))}
      </G>
    </Svg>
  );
};

/**
 * Minimal Grid Pattern
 * A partial grid/lattice with varying line weights
 */
const MinimalGridPattern: React.FC<{ color: string; width: number; height: number }> = ({ 
  color, 
  width, 
  height 
}) => {
  const padding = 20;
  const gridWidth = width - (padding * 2);
  const gridHeight = height - 8;
  const cols = 8;
  const rows = 2;
  const cellWidth = gridWidth / cols;
  const cellHeight = gridHeight / rows;
  
  const lines = [];
  
  // Horizontal lines with varying opacity
  for (let i = 0; i <= rows; i++) {
    const y = 4 + (i * cellHeight);
    const opacity = i === 1 ? 0.5 : 0.25; // Middle line more prominent
    lines.push(
      <Line
        key={`h-${i}`}
        x1={padding}
        y1={y}
        x2={width - padding}
        y2={y}
        stroke={color}
        strokeWidth={i === 1 ? 1.5 : 0.75}
        opacity={opacity}
      />
    );
  }
  
  // Vertical lines - only some, creating asymmetry
  const verticalPositions = [0, 2, 3, 5, 6, 8]; // Skip some for visual interest
  verticalPositions.forEach((col, index) => {
    const x = padding + (col * cellWidth);
    const opacity = col === 3 || col === 5 ? 0.4 : 0.2;
    lines.push(
      <Line
        key={`v-${index}`}
        x1={x}
        y1={4}
        x2={x}
        y2={height - 4}
        stroke={color}
        strokeWidth={0.75}
        opacity={opacity}
      />
    );
  });
  
  // Small accent dots at intersections
  const dots = [
    { x: padding + (3 * cellWidth), y: 4 + cellHeight },
    { x: padding + (5 * cellWidth), y: 4 + cellHeight },
  ];
  
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {lines}
      {dots.map((dot, index) => (
        <Circle
          key={`dot-${index}`}
          cx={dot.x}
          cy={dot.y}
          r={2}
          fill={color}
          opacity={0.5}
        />
      ))}
    </Svg>
  );
};

/**
 * Waveform Pattern
 * Subtle sine-wave lines suggesting frequency/field energy
 */
const WaveformPattern: React.FC<{ color: string; width: number; height: number }> = ({ 
  color, 
  width, 
  height 
}) => {
  const centerY = height / 2;
  const amplitude1 = height * 0.25;
  const amplitude2 = height * 0.15;
  const amplitude3 = height * 0.08;
  
  // Generate smooth wave path
  const generateWavePath = (amp: number, frequency: number, phaseShift: number = 0) => {
    const points = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const y = centerY + Math.sin(((i / steps) * Math.PI * frequency) + phaseShift) * amp;
      points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return points.join(' ');
  };
  
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Primary wave - most prominent */}
      <Path
        d={generateWavePath(amplitude1, 2, 0)}
        stroke={color}
        strokeWidth={1.5}
        fill="none"
        opacity={0.4}
      />
      
      {/* Secondary wave - offset phase */}
      <Path
        d={generateWavePath(amplitude2, 3, Math.PI / 4)}
        stroke={color}
        strokeWidth={1}
        fill="none"
        opacity={0.3}
      />
      
      {/* Tertiary wave - higher frequency, subtle */}
      <Path
        d={generateWavePath(amplitude3, 5, Math.PI / 2)}
        stroke={color}
        strokeWidth={0.75}
        fill="none"
        opacity={0.2}
      />
      
      {/* Center baseline */}
      <Line
        x1={0}
        y1={centerY}
        x2={width}
        y2={centerY}
        stroke={color}
        strokeWidth={0.5}
        opacity={0.15}
        strokeDasharray="4,4"
      />
    </Svg>
  );
};

/**
 * GeometricBanner Component
 * Renders a precise geometric pattern in the header area
 */
export const GeometricBanner: React.FC<GeometricBannerProps> = ({
  pattern,
  color,
  width = 200,
  height = 40,
}) => {
  const renderPattern = () => {
    switch (pattern) {
      case 'sacred':
        return <SacredGeometryPattern color={color} width={width} height={height} />;
      case 'grid':
        return <MinimalGridPattern color={color} width={width} height={height} />;
      case 'waveform':
        return <WaveformPattern color={color} width={width} height={height} />;
      default:
        return <WaveformPattern color={color} width={width} height={height} />;
    }
  };

  return (
    <View style={[styles.container, { width, height }]}>
      {renderPattern()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GeometricBanner;
