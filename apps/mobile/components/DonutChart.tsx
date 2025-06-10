import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { G, Circle, Text as SvgText } from 'react-native-svg';

interface Stat {
  name: string;
  value: number;
}

interface DonutChartProps {
  stats: Stat[];
}

const DonutChart: React.FC<DonutChartProps> = ({ stats }) => {
  const macronutrients = stats.filter(stat => stat.name !== 'Calories');
  const caloriesStat = stats.find(stat => stat.name === 'Calories');
  const calories = caloriesStat?.value || 0;
  
  const total = macronutrients.reduce((sum, stat) => sum + (stat.value || 0), 0);
  const radius = 70;
  const strokeWidth = 30;
  const center = radius + strokeWidth;
  const viewBox = center * 2;
  
  const colors = ['#ff6384', '#36a2eb', '#ffcd56'];
  
  let currentAngle = 0;
  const circles = macronutrients.map((stat, index) => {
    const percentage = total === 0 ? 0 : ((stat.value || 0) / total);
    const angle = percentage * 360;
    
    // Calculate the arc path
    const x1 = center + radius * Math.cos((currentAngle - 90) * Math.PI / 180);
    const y1 = center + radius * Math.sin((currentAngle - 90) * Math.PI / 180);
    const x2 = center + radius * Math.cos((currentAngle + angle - 90) * Math.PI / 180);
    const y2 = center + radius * Math.sin((currentAngle + angle - 90) * Math.PI / 180);
    
    // Create the circle segment
    const circle = (
      <Circle
        key={stat.name}
        cx={center}
        cy={center}
        r={radius}
        stroke={colors[index]}
        strokeWidth={strokeWidth}
        strokeDasharray={`${(angle / 360) * (2 * Math.PI * radius)} ${2 * Math.PI * radius}`}
        rotation={currentAngle - 90}
        originX={center}
        originY={center}
        fill="transparent"
      />
    );
    
    currentAngle += angle;
    return circle;
  });

  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <Svg height={250} width={250} viewBox={`0 0 ${viewBox} ${viewBox}`}>
        <G>
          {circles}
          <SvgText
            x={center}
            y={center - 10}
            fontSize="24"
            fontWeight="bold"
            fill="#333"
            textAnchor="middle"
          >
            {calories.toFixed(1)}
          </SvgText>
          <SvgText
            x={center}
            y={center + 20}
            fontSize="14"
            fill="#666"
            textAnchor="middle"
          >
            Calories
          </SvgText>
        </G>
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 10 }}>
        {macronutrients.map((stat, index) => (
          <View 
            key={stat.name} 
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginHorizontal: 10,
              marginVertical: 5,
            }}
          >
            <View 
              style={{ 
                width: 12, 
                height: 12, 
                backgroundColor: colors[index], 
                marginRight: 5, 
                borderRadius: 6 
              }} 
            />
            <Text style={{ color: '#7F7F7F', fontSize: 12 }}>
              {stat.name}: {(stat.value || 0).toFixed(1)}g
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default DonutChart; 