import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { CalendarEvent } from '@/@types/screens/calendar';

interface EventModalProps {
  selectedEvent: CalendarEvent | null;
  showEventModal: boolean;
  setShowEventModal: (show: boolean) => void;
  backgroundColor: string;
  mutedColor: string;
  textColor: string;
}

export const EventModal: React.FC<EventModalProps> = ({
  selectedEvent,
  showEventModal,
  setShowEventModal,
  backgroundColor,
  mutedColor,
  textColor
}) => {
  if (!selectedEvent) return null;
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showEventModal}
      onRequestClose={() => setShowEventModal(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="rounded-t-3xl p-6 max-h-3/4" style={{backgroundColor}}>
              
          <View className="space-y-5">
              
              <View className="mb-5" style={{borderBottomColor: mutedColor, borderBottomWidth: 2}}>
                <Text className="py-3 font-bold text-lg" style={{color: '#be2e2e'}}>{selectedEvent.title}</Text>
              </View>
            <View className="flex-row mb-3 items-center">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{backgroundColor: `${selectedEvent.color}20`}}>
                <CalendarIcon size={20} color={selectedEvent.color} />
              </View>
              
              <View>
                <Text className="text-sm" style={{color: mutedColor}}>Date</Text>
                <Text style={{color: textColor}}>{selectedEvent.start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Text>
              </View>
            </View>
            
            <View className="flex-row mb-3 items-center">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{backgroundColor: `${selectedEvent.color}20`}}>
                <Text className="text-xs font-bold" style={{color: selectedEvent.color}}>⏰</Text>
              </View>
              <View>
                <Text className="text-sm" style={{color: mutedColor}}>Time</Text>
                <Text style={{color: textColor}}>
                  {selectedEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {selectedEvent.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
            
            <View>
              <Text className="text-sm mb-2" style={{color: mutedColor}}>Description</Text>
              <Text className="leading-5" style={{color: textColor}}>{selectedEvent.description}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            className="mt-8 rounded-xl p-4 items-center"
            style={{backgroundColor: selectedEvent.color}}
            onPress={() => setShowEventModal(false)}
          >
            <Text className="text-white font-bold text-base">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
