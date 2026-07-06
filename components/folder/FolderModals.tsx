import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ActivityIndicator, Animated } from 'react-native';
import { AlertTriangle, Check, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react-native';
import { FileInfo } from '@/@types/tabs';

// --- Quality Modal Content ---
export function QualityModalContent({
  sharpPercentage, blurPercentage, pendingImageUpload, onUpload, countdown, onCountdownChange, onReset
}: {
  sharpPercentage: number;
  blurPercentage: number;
  pendingImageUpload: { reqId: string | null; fileInfo: FileInfo } | null;
  onUpload: (upload: { reqId: string | null; fileInfo: FileInfo }) => Promise<void>;
  countdown: number;
  onCountdownChange: (n: number | ((prev: number) => number)) => void;
  onReset: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    onReset();
    timerRef.current = setInterval(() => {
      onCountdownChange((prev: number) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (pendingImageUpload) onUpload(pendingImageUpload);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <View className="flex-1 bg-black/50 justify-center items-center p-4">
      <View className="bg-white rounded-xl p-6 w-full max-w-md">
        <View className="items-center mb-3">
          <View className="bg-green-100 p-4 rounded-full">
            <Check size={32} color="#16a34a" />
          </View>
        </View>

        <Text className="text-xl font-bold text-gray-800 text-center mb-1">Image Quality Check</Text>
        <Text className="text-gray-500 text-sm text-center mb-4">Analysis complete — image is acceptable</Text>

        <View className="mb-5">
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm font-medium text-gray-700">Sharp</Text>
            <Text className="text-sm font-bold text-green-600">{sharpPercentage}%</Text>
          </View>
          <View className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <View className="bg-green-500 h-3 rounded-full" style={{ width: `${sharpPercentage}%` }} />
          </View>

          <View className="flex-row justify-between mb-1">
            <Text className="text-sm font-medium text-gray-700">Blur</Text>
            <Text className="text-sm font-bold text-orange-500">{blurPercentage}%</Text>
          </View>
          <View className="w-full bg-gray-200 rounded-full h-3">
            <View className="bg-orange-400 h-3 rounded-full" style={{ width: `${blurPercentage}%` }} />
          </View>
        </View>

        <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <Text className="text-green-800 text-xs text-center">✓ Image passed quality validation. Uploading in {countdown}s...</Text>
        </View>

        <ActivityIndicator size="small" color="#be2e2e" />
      </View>
    </View>
  );
}

// --- File Type Selection Modal ---
interface FileTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onPickDocument: () => void;
  onPickImage: () => void;
}

export const FileTypeModal: React.FC<FileTypeModalProps> = ({
  visible,
  onClose,
  onPickDocument,
  onPickImage,
}) => (
  <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
    <View className="flex-1 bg-black/50 justify-center items-center p-4">
      <View className="bg-white rounded-lg p-6 w-full max-w-md">
        <Text className="text-xl font-bold text-gray-800 mb-2">Select File Type</Text>
        <Text className="text-gray-600 mb-3">Choose the type of file you want to upload</Text>

        <View className="flex-row gap-5 justify-center">
          <TouchableOpacity className="bg-blue-100 p-4 rounded-lg items-center w-32" onPress={onPickDocument}>
            <View className="flex-row gap-3 justify-center w-full mb-1">
              <Image source={require("../../assets/images/pdf.png")} className="w-6 h-6" />
              <Image source={require("../../assets/images/docs.png")} className="w-6 h-6" />
            </View>
            <Text className="text-red-800 mt-2 text-center">Document</Text>
            <Text className="text-red-600 text-xs text-center">PDF, Word</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-purple-100 p-4 rounded-lg items-center w-32" onPress={onPickImage}>
            <View className="flex-row justify-center gap-3 w-full mb-1">
              <Image source={require("../../assets/images/jpg.png")} className="w-6 h-6" />
              <Image source={require("../../assets/images/png.png")} className="w-6 h-6" />
            </View>
            <Text className="text-red-800 mt-2 text-center">Image</Text>
            <Text className="text-red-600 text-xs text-center">JPG, PNG</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity className="mt-6 bg-gray-200 py-3 rounded-lg" onPress={onClose}>
          <Text className="text-gray-800 text-center font-medium">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// --- Confirmation Modal ---
interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText: string;
  confirmColor?: string;
  icon?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmColor = "#be2e2e",
  icon,
}) => (
  <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
    <View className="flex-1 bg-black/50 justify-center items-center p-4">
      <View className="bg-white rounded-xl p-6 w-full max-w-md">
        {icon && <View className="items-center mb-4">{icon}</View>}
        <Text className="text-xl font-bold text-gray-800 text-center mb-2">{title}</Text>
        <View className="mb-6">{typeof message === 'string' ? <Text className="text-gray-600 text-center">{message}</Text> : message}</View>
        <View className="flex-row justify-between gap-4">
          <TouchableOpacity className="flex-1 bg-gray-200 py-4 rounded-lg" onPress={onClose}>
            <Text className="text-gray-800 text-center font-medium">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: confirmColor }}
            className="flex-1 py-4 rounded-lg flex-row items-center justify-center"
            onPress={onConfirm}
          >
            <Text className="text-white text-center font-medium">{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// --- Progress Modal ---
interface ProgressModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  progress?: number;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  visible,
  title,
  subtitle,
  progress,
}) => (
  <Modal visible={visible} transparent={true} animationType="fade">
    <View className="flex-1 bg-black/50 justify-center items-center p-4">
      <View className="bg-white rounded-lg p-6 w-full max-w-md items-center">
        <ActivityIndicator size="large" color="#be2e2e" />
        <Text className="text-gray-800 text-lg font-medium mt-4">{title}</Text>
        {subtitle && <Text className="text-gray-600 mt-2 text-center">{subtitle}</Text>}
        {progress !== undefined && (
          <>
            <Text className="text-gray-600 mt-2">{progress}% complete</Text>
            <View className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <View className="bg-[#be2e2e] h-2.5 rounded-full" style={{ width: `${progress}%` }} />
            </View>
          </>
        )}
      </View>
    </View>
  </Modal>
);

// --- Image View Modal ---
interface ImageViewModalProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
  scale: Animated.Value;
  rotation: Animated.Value;
  currentScale: number;
  currentRotation: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onTapToZoom: () => void;
}

export const ImageViewModal: React.FC<ImageViewModalProps> = ({
  visible,
  imageUrl,
  onClose,
  scale,
  rotation,
  onZoomIn,
  onZoomOut,
  onRotate,
  onTapToZoom,
}) => (
  <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
    <View className="flex-1 bg-black/90 items-center justify-center">
      <View className="absolute top-12 left-4 right-4 flex-row justify-between items-center z-10">
        <TouchableOpacity className="bg-white/20 p-3 rounded-full" onPress={onClose}>
          <X size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-row gap-3">
          <TouchableOpacity className="bg-white/20 p-3 rounded-full" onPress={onZoomIn}>
            <ZoomIn size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-white/20 p-3 rounded-full" onPress={onZoomOut}>
            <ZoomOut size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-white/20 p-3 rounded-full" onPress={onRotate}>
            <RotateCcw size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-1 w-full items-center justify-center p-4">
        <TouchableOpacity activeOpacity={1} onPress={onTapToZoom} className="w-full h-4/5">
          <Animated.View
            style={{
              transform: [
                { scale },
                { rotate: rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }
              ]
            }}
            className="w-full h-full"
          >
            {imageUrl && <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="contain" />}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// --- Blur Error Modal ---
export const BlurErrorModal: React.FC<{
  visible: boolean;
  blurPercentage: number;
  sharpPercentage: number;
  onClose: () => void;
}> = ({ visible, blurPercentage, sharpPercentage, onClose }) => (
  <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
    <View className="flex-1 bg-black/50 justify-center items-center p-4">
      <View className="bg-white rounded-xl p-6 w-full max-w-md">
        <View className="items-center mb-3">
          <View className="bg-red-100 p-4 rounded-full">
            <AlertTriangle size={32} color="#dc2626" />
          </View>
        </View>
        <Text className="text-xl font-bold text-gray-800 text-center mb-1">Image Quality Check</Text>
        <Text className="text-gray-500 text-sm text-center mb-4">Analysis complete — image is too blurry</Text>
        <View className="mb-5">
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm font-medium text-gray-700">Blur</Text>
            <Text className="text-sm font-bold text-red-600">{blurPercentage}%</Text>
          </View>
          <View className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <View className="bg-red-500 h-3 rounded-full" style={{ width: `${blurPercentage}%` }} />
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm font-medium text-gray-700">Sharp</Text>
            <Text className="text-sm font-bold text-gray-500">{sharpPercentage}%</Text>
          </View>
          <View className="w-full bg-gray-200 rounded-full h-3">
            <View className="bg-gray-400 h-3 rounded-full" style={{ width: `${sharpPercentage}%` }} />
          </View>
        </View>
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
          <Text className="text-red-800 text-xs text-center font-medium">✗ Image failed quality validation.</Text>
          <Text className="text-red-700 text-xs text-center mt-1">Please retake or choose a clearer image before uploading.</Text>
        </View>
        <TouchableOpacity className="bg-[#be2e2e] py-3 rounded-lg" onPress={onClose}>
          <Text className="text-white text-center font-medium">Try Another Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);
