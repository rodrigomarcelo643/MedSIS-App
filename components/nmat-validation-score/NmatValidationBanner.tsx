import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';
import { NMAT_PASSING_RATE } from '@/@types/screens/nmat-validation';

interface NmatValidationBannerProps {
  isPassing: boolean;
  percentileRank: number;
}

export const NmatValidationBanner: React.FC<NmatValidationBannerProps> = ({ isPassing, percentileRank }) => {
  const bgColor = isPassing ? '#dcfce7' : '#fee2e2';
  const borderColor = isPassing ? '#16a34a' : '#dc2626';
  const textColor = isPassing ? '#15803d' : '#b91c1c';
  const Icon = isPassing ? CheckCircle : XCircle;

  return (
    <View style={{ backgroundColor: bgColor, borderLeftWidth: 4, borderLeftColor: borderColor, borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon size={20} color={borderColor} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: textColor, fontWeight: '600', fontSize: 14 }}>
          {isPassing ? 'NMAT Requirement Met' : 'NMAT Requirement Not Met'}
        </Text>
        <Text style={{ color: textColor, fontSize: 12, marginTop: 2 }}>
          Your percentile rank of {percentileRank} is {isPassing ? 'above' : 'below'} the required {NMAT_PASSING_RATE}th percentile.
        </Text>
      </View>
    </View>
  );
};
