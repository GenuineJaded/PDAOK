import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Rect, Polygon } from 'react-native-svg';

interface AlchemicalSymbolProps {
  size?: number;
  color: string;
  strokeWidth?: number;
}

/**
 * Alchemical symbol: Circle, Square, Triangle
 * Represents transmutation and integration
 * Used for Quick Log button
 */
export const AlchemicalSymbol: React.FC<AlchemicalSymbolProps> = ({
  size = 32,
  color,
  strokeWidth = 1.5,
}) => {
  const center = size / 2;
  const radius = (size / 2) - strokeWidth;
  
  // Square dimensions (inscribed in circle)
  const squareSize = radius * 1.4; // Slightly smaller than circle diameter
  const squareHalf = squareSize / 2;
  
  // Triangle points (inscribed in square)
  const triangleHeight = squareSize * 0.85;
  const triangleBase = squareSize * 0.85;
  
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Square */}
        <Rect
          x={center - squareHalf}
          y={center - squareHalf}
          width={squareSize}
          height={squareSize}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Triangle (pointing up) */}
        <Polygon
          points={`
            ${center},${center - triangleHeight / 2}
            ${center - triangleBase / 2},${center + triangleHeight / 2}
            ${center + triangleBase / 2},${center + triangleHeight / 2}
          `}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
        />
      </Svg>
    </View>
  );
};
