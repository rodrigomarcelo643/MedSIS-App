import React from 'react';
import { View, Text } from 'react-native';
import { NmatValidationResult, NMAT_PASSING_RATE } from '@/@types/screens/nmat-validation';

interface NmatScoreCardProps {
  result: NmatValidationResult;
  textColor: string;
  cardColor: string;
}

export const NmatScoreCard: React.FC<NmatScoreCardProps> = ({ result, textColor, cardColor }) => {
  const { score, isPassing, status } = result;
  const statusColor = isPassing ? '#16a34a' : '#dc2626';

  return (
    <View style={{ backgroundColor: cardColor, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
      <Text style={{ color: textColor, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
        NMAT Score
      </Text>

      <View className="flex-row justify-between mb-3">
        <View className="items-center flex-1">
          <Text style={{ color: '#6b7280', fontSize: 12 }}>Percentile Rank</Text>
          <Text style={{ color: textColor, fontSize: 28, fontWeight: 'bold' }}>
            {score?.percentile_rank ?? '--'}
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text style={{ color: '#6b7280', fontSize: 12 }}>Passing Rate</Text>
          <Text style={{ color: textColor, fontSize: 28, fontWeight: 'bold' }}>
            {NMAT_PASSING_RATE}%
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text style={{ color: '#6b7280', fontSize: 12 }}>Status</Text>
          <Text style={{ color: statusColor, fontSize: 16, fontWeight: 'bold', textTransform: 'capitalize', marginTop: 4 }}>
            {status}
          </Text>
        </View>
      </View>

      {score && (
        <View style={{ borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10, marginTop: 4 }}>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>
            Exam Series: {score.exam_series} · Date: {score.date_taken}
          </Text>
        </View>
      )}
    </View>
  );
};
