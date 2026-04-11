import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Image } from 'react-native';

interface ChatModalsProps {
  showEditModal: boolean;
  showUnsendModal: boolean;
  navigatingToInfo: boolean;
  imageModalVisible: boolean;
  selectedImageUrl: string | null;
  imageCarousel: string[];
  currentImageIndex: number;
  textColor: string;
  cardColor: string;
  onCloseImageModal: () => void;
  onPrevImage: () => void;
  onNextImage: () => void;
}

export const ChatModals: React.FC<ChatModalsProps> = ({
  showEditModal,
  showUnsendModal,
  navigatingToInfo,
  imageModalVisible,
  imageCarousel,
  currentImageIndex,
  textColor,
  cardColor,
  onCloseImageModal,
  onPrevImage,
  onNextImage,
}) => (
  <>
    {/* Edit Loading Modal */}
    <Modal visible={showEditModal} transparent animationType="fade">
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="rounded-lg p-6 items-center" style={{ backgroundColor: cardColor, minWidth: 200 }}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text className="mt-4 text-base font-medium" style={{ color: textColor }}>Saving changes...</Text>
        </View>
      </View>
    </Modal>
    
    {/* Unsend Loading Modal */}
    <Modal visible={showUnsendModal} transparent animationType="fade">
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="rounded-lg p-6 items-center" style={{ backgroundColor: cardColor, minWidth: 200 }}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text className="mt-4 text-base font-medium" style={{ color: textColor }}>Unsending message...</Text>
        </View>
      </View>
    </Modal>
    
    {/* Navigation Loading Modal */}
    <Modal visible={navigatingToInfo} transparent animationType="fade">
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="rounded-lg p-6 items-center" style={{ backgroundColor: cardColor, minWidth: 200 }}>
          <ActivityIndicator size="large" color="#af1616" />
          <Text className="mt-4 text-base font-medium" style={{ color: textColor }}>Loading Chat Info...</Text>
        </View>
      </View>
    </Modal>
    
    {/* Image Carousel Modal */}
    <Modal
      visible={imageModalVisible}
      transparent
      animationType="fade"
      onRequestClose={onCloseImageModal}
    >
      <View className="flex-1 bg-black">
        <TouchableOpacity
          className="absolute top-12 right-4 z-10 w-14 h-14 rounded-full bg-white bg-opacity-90 items-center justify-center shadow-lg"
          onPress={onCloseImageModal}
          style={{ elevation: 5 }}
        >
          <Text className="text-black text-2xl font-bold">×</Text>
        </TouchableOpacity>
        
        {imageCarousel.length > 1 && (
          <View className="absolute top-12 left-4 z-10 px-3 py-1 rounded-full bg-black bg-opacity-50">
            <Text className="text-white text-sm">{currentImageIndex + 1} / {imageCarousel.length}</Text>
          </View>
        )}
        
        {imageCarousel[currentImageIndex] && (
          <Image
            source={{ uri: imageCarousel[currentImageIndex] }}
            className="flex-1"
            resizeMode="contain"
          />
        )}
        
        {imageCarousel.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <TouchableOpacity
                className="absolute left-4 top-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 items-center justify-center"
                onPress={onPrevImage}
                style={{ marginTop: -24 }}
              >
                <Text className="text-white text-2xl font-bold">‹</Text>
              </TouchableOpacity>
            )}
            
            {currentImageIndex < imageCarousel.length - 1 && (
              <TouchableOpacity
                className="absolute right-4 top-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 items-center justify-center"
                onPress={onNextImage}
                style={{ marginTop: -24 }}
              >
                <Text className="text-white text-2xl font-bold">›</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </Modal>
  </>
);
