import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { X, BookOpen, UserCheck, LayoutList } from 'lucide-react-native';
import { Evaluation } from '@/@types/tabs';
import { useThemeColor } from '@/hooks/useThemeColor';

interface Props {
  visible: boolean;
  evaluation: Evaluation | null;
  onClose: () => void;
}

/**
 * Detailed view of a specific evaluation record.
 * Following the sharpened 2px rounded style.
 */
const EvaluationDetailModal: React.FC<Props> = ({ visible, evaluation, onClose }) => {
  const cardColor  = useThemeColor({}, 'card');
  const textColor  = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');

  if (!evaluation) return null;

  const DetailRow = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color?: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 }}>
      <View style={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: mutedColor, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</Text>
        <Text style={{ fontSize: 15, fontWeight: '700', color: color || textColor }}>{value}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 }}>
        <View style={{ backgroundColor: cardColor, borderRadius: 2, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 }}>
          
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: textColor, marginBottom: 4 }}>
                Course Evaluation
              </Text>
              <Text style={{ fontSize: 13, color: mutedColor }}>
                Full records from the academic database
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <X size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Details */}
          <DetailRow 
            icon={<BookOpen size={18} color="#be2e2e" />} 
            label="Subject" 
            value={`${evaluation.code} - ${evaluation.title}`} 
          />
          
          <DetailRow 
            icon={<LayoutList size={18} color="#be2e2e" />} 
            label="Academic Term" 
            value={evaluation.term === '1st_semestral' ? '1st Semestral' : '2nd Semestral'} 
          />

          <DetailRow 
            icon={<UserCheck size={18} color={evaluation.grade ? '#16a34a' : '#f97316'} />} 
            label="Result" 
            value={evaluation.grade || 'Pending Evaluation'} 
            color={evaluation.grade ? '#16a34a' : '#f97316'}
          />

          <View style={{ marginTop: 8, padding: 16, backgroundColor: '#f9fafb', borderRadius: 2, borderLeftWidth: 4, borderLeftColor: '#be2e2e' }}>
            <Text style={{ fontSize: 11, color: mutedColor, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Status Remarks</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: textColor }}>
              {evaluation.remarks || 'Wait for the instructor to post the final grade and remarks.'}
            </Text>
          </View>

          {/* Action */}
          <TouchableOpacity
            onPress={onClose}
            style={{ 
              marginTop: 32, 
              backgroundColor: '#be2e2e', 
              paddingVertical: 14, 
              borderRadius: 2, 
              alignItems: 'center' 
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Close Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default EvaluationDetailModal;
