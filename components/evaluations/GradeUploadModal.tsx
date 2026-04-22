import { GradeImage } from '@/@types/tabs';
import { BlurErrorModal, ProgressModal } from '@/components/folder/FolderModals';
import { API_BASE_URL, ML_API_BASE_URL } from '@/constants/Config';
import { useThemeColor } from '@/hooks/useThemeColor';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { AlertTriangle, CheckCircle, Eye, ImageIcon, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

interface Props {
  visible: boolean;
  onClose: () => void;
  onUploaded: () => void;
  userId: string;
  yearLevelId: number;
  yearLevelName: string;
  existingImages: GradeImage[];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GradeUploadModal: React.FC<Props> = ({
  visible,
  onClose,
  onUploaded,
  userId,
  yearLevelId,
  yearLevelName,
  existingImages,
}) => {
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');

  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [fileName, setFileName] = useState<string>('grade_image.jpg');
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);

  // Blur check modal state
  const [checkingBlur, setCheckingBlur] = useState<boolean>(false);
  const [showBlurErrorModal, setShowBlurErrorModal] = useState<boolean>(false);
  const [blurPercentage, setBlurPercentage] = useState<number>(0);
  const [sharpPercentage, setSharpPercentage] = useState<number>(0);

  // Status for deletion
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Custom Confirmation Modal State
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Full screen preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const checkImageBlur = async (uri: string, fileName: string, mimeType: string) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: fileName || `blur_check_${Date.now()}.jpg`,
        type: mimeType || 'image/jpeg',
      } as any);

      console.log("Calling ML Blur Check (Fetch):", `${ML_API_BASE_URL}/api/app/blur-check`);

      const response = await fetch(`${ML_API_BASE_URL}/api/app/blur-check`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rawScore = typeof data?.blur_score === 'number' ? data.blur_score : 0;
      const isBlurry = data?.is_blurry === true;

      const sharpScore = Math.min(100, Math.round((rawScore / 1000) * 100));
      const blurScore = 100 - sharpScore;

      return { isBlurry, blurScore, sharpScore };
    } catch (error) {
      console.error('Blur check error:', error);
      return { isBlurry: false, blurScore: 0, sharpScore: 100 };
    }
  };

  const reset = () => {
    setPickedUri(null);
    setUploadDone(false);
    setUploading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.85,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];

      // Quality check before setting
      setCheckingBlur(true);
      const assetFileName = asset.fileName ?? `grade_image_${Date.now()}.` + (asset.uri.split('.').pop() ?? 'jpg');
      const assetMimeType = asset.mimeType ?? 'image/jpeg';

      const { isBlurry, blurScore, sharpScore } = await checkImageBlur(asset.uri, assetFileName, assetMimeType);
      setCheckingBlur(false);

      setBlurPercentage(blurScore);
      setSharpPercentage(sharpScore);

      if (isBlurry || blurScore > 40) {
        setShowBlurErrorModal(true);
        return; // Stop here if blurry
      }

      setPickedUri(asset.uri);
      setMimeType(assetMimeType);
      setFileName(assetFileName);
      setUploadDone(false);
    }
  };

  const handleUpload = async () => {
    if (!pickedUri) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('year_level_id', String(yearLevelId));
      // @ts-ignore
      formData.append('file', {
        uri: pickedUri,
        name: fileName,
        type: mimeType,
      });

      console.log("Uploading Grade Image to:", `${API_BASE_URL}/api/grade_uploads/upload_grade_image.php`);

      const response = await fetch(`${API_BASE_URL}/api/grade_uploads/upload_grade_image.php`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Grade Upload Response:", data);

      if (data.success) {
        setUploadDone(true);
        onUploaded();
        Toast.show({
          type: 'success',
          text1: 'Upload Successful',
          text2: 'Your grade record has been updated.',
        });
      } else {
        Alert.alert('Upload Failed', data.message || 'An error occurred');
      }
    } catch (error: any) {
      console.error('Grade Upload Error Details:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || error.message || "Network Error";
      Alert.alert('Upload Error', errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const executeDelete = async () => {
    const imageId = confirmDeleteId;
    if (!imageId) return;

    setConfirmDeleteId(null);
    setDeletingId(imageId);

    try {
      // Using JSON payload + explicit headers to fix "connection error" issues
      const res = await axios.post(
        `${API_BASE_URL}/api/grade_uploads/delete_grade_image.php`,
        {
          user_id: userId,
          image_id: imageId,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Record Deleted',
          text2: 'The grade image has been removed.',
        });
        onUploaded();
      } else {
        Alert.alert('Deletion Failed', res.data.message);
      }
    } catch (err: any) {
      console.error('Delete Error:', err?.response?.data || err.message);
      Alert.alert('Connection Error', 'Failed to reach the server. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View
            style={{
              backgroundColor: cardColor,
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
              padding: 24,
              maxHeight: '92%',
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: textColor }}>Grade Uploads</Text>
                <Text style={{ fontSize: 12, color: mutedColor }}>{yearLevelName}</Text>
              </View>
              <TouchableOpacity onPress={handleClose}>
                <X size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            {/* List */}
            {existingImages.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: mutedColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                  Already Uploaded ({existingImages.length})
                </Text>

                <View style={{ gap: 8 }}>
                  {existingImages.map((img) => (
                    <View
                      key={img.id}
                      style={{
                        backgroundColor: cardColor,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 2,
                        borderWidth: 1,
                        borderColor: '#e5e7eb'
                      }}
                    >
                      {/* Left: Indicator, Image Thumbnail, and Details */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={{ width: 4, height: 32, backgroundColor: '#10b981', borderTopLeftRadius: 2, borderBottomLeftRadius: 2, marginRight: 12 }} />

                        {img.image_data ? (
                          <Image source={{ uri: img.image_data }} style={{ width: 40, height: 40, borderRadius: 2, marginRight: 12, borderWidth: 1, borderColor: '#f3f4f6' }} resizeMode="cover" />
                        ) : (
                          <View style={{ width: 40, height: 40, backgroundColor: '#f9fafb', borderRadius: 2, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#f3f4f6' }}>
                            <ImageIcon size={20} color="#9ca3af" />
                          </View>
                        )}

                        <View style={{ flex: 1, marginRight: 12 }}>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: textColor }} numberOfLines={1}>
                            {img.file_name}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 }}>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#166534' }}>Verified Record</Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Right: Actions */}
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity
                          style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: 1, padding: 8, borderRadius: 2 }}
                          onPress={() => setPreviewImage(img.image_data)}
                        >
                          <Eye size={16} color="#2563eb" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, padding: 8, borderRadius: 2 }}
                          onPress={() => setConfirmDeleteId(img.id)}
                          disabled={deletingId === img.id}
                        >
                          {deletingId === img.id ? (
                            <ActivityIndicator size="small" color="#dc2626" />
                          ) : (
                            <Trash2 size={16} color="#dc2626" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Upload Area */}
            {uploadDone ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <View style={{ backgroundColor: '#f0fdf4', padding: 20, borderRadius: 100, marginBottom: 16 }}>
                  <CheckCircle size={48} color="#16a34a" />
                </View>
                <Text style={{ fontSize: 17, fontWeight: '800', color: textColor }}>Update Successful!</Text>
                <TouchableOpacity onPress={reset} style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 32, backgroundColor: '#be2e2e', borderRadius: 2 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Upload More</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={{ fontSize: 11, fontWeight: '800', color: mutedColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                  {pickedUri ? 'Image Selected' : 'Submission'}
                </Text>
                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    borderWidth: 2, borderColor: pickedUri ? '#be2e2e' : '#e5e7eb', borderStyle: 'dashed',
                    borderRadius: 8, height: 180, alignItems: 'center', justifyContent: 'center',
                    marginBottom: 12, backgroundColor: pickedUri ? 'transparent' : '#f9fafb'
                  }}
                >
                  {pickedUri ? (
                    <Image source={{ uri: pickedUri }} style={{ width: '100%', height: '100%', borderRadius: 6 }} resizeMode="contain" />
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Image source={require("../../assets/images/no_file.png")} style={{ width: 80, height: 80 }} />
                      <Text style={{ color: mutedColor, marginTop: 8, fontSize: 14 }}>
                        No files selected yet
                      </Text>
                      <Text style={{ color: '#d1d5db', fontSize: 11, marginTop: 2 }}>JPG, JPEG, PNG up to 5MB</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {pickedUri ? (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                    <TouchableOpacity onPress={() => setPickedUri(null)} style={{ flex: 1, padding: 14, borderRadius: 2, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' }}>
                      <Text style={{ fontWeight: '700' }}>Clear</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleUpload}
                      disabled={uploading}
                      style={{ flex: 2, backgroundColor: uploading ? '#d1d5db' : '#be2e2e', padding: 14, borderRadius: 2, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                    >
                      {uploading && <ActivityIndicator color="#fff" size="small" />}
                      <Text style={{ color: '#fff', fontWeight: '800' }}>{uploading ? 'Processing' : 'Submit Record'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
                    <TouchableOpacity
                      style={{ backgroundColor: '#be2e2e', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minWidth: 128 }}
                      onPress={pickImage}
                      disabled={uploading}
                    >
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                        Browse Files
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Custom Deletion Confirmation Modal ── */}
      <Modal visible={confirmDeleteId !== null} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 30 }}>
          <View style={{ backgroundColor: cardColor, borderRadius: 2, padding: 24, alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fef2f2', padding: 16, borderRadius: 50, marginBottom: 16 }}>
              <AlertTriangle size={36} color="#dc2626" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: textColor, marginBottom: 8 }}>Remove Image?</Text>
            <Text style={{ fontSize: 14, color: mutedColor, textAlign: 'center', marginBottom: 24 }}>
              This will permanently delete this grade record from your file. This action cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                onPress={() => setConfirmDeleteId(null)}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 2, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' }}
              >
                <Text style={{ fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={executeDelete}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 2, backgroundColor: '#dc2626', alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Full Preview Modal ── */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
          <TouchableOpacity onPress={() => setPreviewImage(null)} style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 2 }}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
          {previewImage && <Image source={{ uri: previewImage }} style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.8 }} resizeMode="contain" />}
        </View>
      </Modal>

      {/* ── Blur Check Modals ── */}
      <ProgressModal
        visible={checkingBlur}
        title="Analyzing Image"
        subtitle="Verifying image quality for medical records..."
      />

      <BlurErrorModal
        visible={showBlurErrorModal}
        blurPercentage={blurPercentage}
        sharpPercentage={sharpPercentage}
        onClose={() => setShowBlurErrorModal(false)}
      />
    </>
  );
};

export default GradeUploadModal;
