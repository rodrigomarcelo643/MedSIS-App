import React, { useEffect } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import { useThemeColor } from '@/hooks/useThemeColor';

interface Props {
  passed: number;
  failed: number;
  total: number;
  percentage: number;
}

const CircularProgress = ({ percentage, textColor }: { percentage: number; textColor: string; }) => {
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle stroke="#e5e7eb" fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        <Circle
          stroke={percentage < 75 ? "#f97316" : "#16a34a"}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: textColor }}>{percentage}%</Text>
        <Text style={{ fontSize: 10, color: '#6b7280' }}>Complete</Text>
      </View>
    </View>
  );
};

const EvaluationSummaryCard: React.FC<Props> = ({ passed, failed, total, percentage }) => {
  const cardColor  = useThemeColor({}, 'card');
  const textColor  = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');

  return (
    <View
      style={{
        backgroundColor: cardColor,
        padding: 20,
        margin: 12,
        borderRadius: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1,
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: '700', color: textColor, marginBottom: 16, textAlign: 'center' }}>
        Evaluation Summary
      </Text>
      
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <CircularProgress percentage={percentage} textColor={textColor} />
        </View>
        
        <View style={{ flex: 1, paddingLeft: 16 }}>
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#16a34a' }}>{passed}</Text>
            <Text style={{ fontSize: 11, color: mutedColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>Passed</Text>
          </View>
          
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#dc2626' }}>{failed}</Text>
            <Text style={{ fontSize: 11, color: mutedColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>Failed</Text>
          </View>
          
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#be2e2e' }}>{total}</Text>
            <Text style={{ fontSize: 11, color: mutedColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Courses</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default EvaluationSummaryCard;
