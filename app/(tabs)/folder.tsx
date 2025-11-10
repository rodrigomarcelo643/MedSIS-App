import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Download,
  Eye,
  File,
  Info,
  RotateCcw,
  Search,
  Trash2,
  X,
  ZoomIn,
  ZoomOut
} from "lucide-react-native";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uri: string;
  type: 'image' | 'pdf' | 'word' | 'document';
  mimeType: string;
  uploaded_at?: string;
  status?: string;
  feedback?: string;
}

interface Requirement {
  id: string;
  name: string;
  completed: boolean;
  file_count: number;
  uploadedFiles: UploadedFile[];
}

interface FileInfo {
  name: string;
  size: number;
  uri: string;
  type: 'image' | 'pdf' | 'word' | 'document';
  mimeType: string;
}

type FilterType = 'all' | 'completed' | 'not-completed';

export default function FolderScreen() {
  const { user } = useAuth();

  // Theme Change 
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  const loadColor = useThemeColor({}, 'loaderCard');
  
  // State for requirements
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // UI states
  const [filter, setFilter] = useState<FilterType>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [showFileTypeModal, setShowFileTypeModal] = useState<boolean>(false);
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [printingFiles, setPrintingFiles] = useState<boolean>(false);
  const [showDownloadConfirmModal, setShowDownloadConfirmModal] = useState<boolean>(false);
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null);
  const [requirementToDelete, setRequirementToDelete] = useState<string | null>(null);
  
  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string>("");
  
  // Image viewing state
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [imageScale] = useState(new Animated.Value(1));
  const [imageRotation] = useState(new Animated.Value(0));
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const [currentScale, setCurrentScale] = useState<number>(1);

  // Fetch requirements based on student's nationality
  const fetchRequirements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user has id
      if (!user?.id) {
        setError("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "https://msis.eduisync.io/api/student_requirements.php",
        {
          user_id: user.id,
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );


      if (response.data.success) {
        const transformedRequirements = response.data.requirements.map(
          (req: any) => ({
            id: req.id,
            name: req.name,
            completed: req.completed || false,
            file_count: req.file_count || 1,
            uploadedFiles: req.uploaded_files || [],
          })
        );

        setRequirements(transformedRequirements);
      } else {
        setError(response.data.message || "Failed to fetch requirements");
      }
    } catch (err) {
      console.error("Error fetching requirements:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch requirements");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [user]);

  // Function to refresh requirements after upload/delete
  const refreshRequirements = async () => {
    try {
      if (!user?.id) return;

      const response = await axios.post(
        "https://msis.eduisync.io/api/student_requirements.php",
        {
          user_id: user.id,
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        const transformedRequirements = response.data.requirements.map(
          (req: any) => ({
            id: req.id,
            name: req.name,
            completed: req.completed || false,
            file_count: req.file_count || 1,
            uploadedFiles: req.uploaded_files || [],
          })
        );

        setRequirements(transformedRequirements);
      }
    } catch (err) {
      console.error("Error refreshing requirements:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to refresh requirements",
      });
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchRequirements();
  };

  // Stats
  const completedCount = requirements.filter((req) => req.completed).length;
  const totalCount = requirements.length;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered and searched requirements
  const filteredRequirements = requirements.filter((req) => {
    if (filter === "completed" && !req.completed) return false;
    if (filter === "not-completed" && req.completed) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return req.name.toLowerCase().includes(query);
    }

    return true;
  });

  // Handle file selection modal
  const openFileTypeModal = (reqId: string) => {
    setSelectedRequirement(reqId);
    setShowFileTypeModal(true);
  };

  // Pick document file
  const pickDocument = async () => {
    try {
      setShowFileTypeModal(false);
      console.log("Starting document picker...");
      
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      console.log("Document picker result:", JSON.stringify(result, null, 2));

      if (result.canceled) {
        console.log("Document picker cancelled by user");
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log("Document selected successfully:", asset);
        
        let mimeType = asset.mimeType;
        
        // If mimeType is not provided, try to determine it from the file name
        if (!mimeType && asset.name) {
          const ext = asset.name.split('.').pop()?.toLowerCase();
          console.log("File extension detected:", ext);
          if (ext === 'pdf') mimeType = 'application/pdf';
          else if (ext === 'doc') mimeType = 'application/msword';
          else if (ext === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
        
        console.log("Final mimeType:", mimeType);
        
        const fileInfo: FileInfo = {
          name: asset.name,
          size: asset.size || 0,
          uri: asset.uri,
          type: mimeType?.includes('pdf') ? 'pdf' : 
                mimeType?.includes('word') ? 'word' : 'document',
          mimeType: mimeType || 'application/octet-stream',
        };
        
        console.log("Prepared file info for upload:", fileInfo);
        await handleFileUpload(selectedRequirement, fileInfo);
      } else {
        console.log("Document picker failed with result:", result);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to select document",
        });
      }
    } catch (err) {
      console.log("Document picker error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick document: " + (err instanceof Error ? err.message : "Unknown error"),
      });
    }
  };

  // Pick image file
  const pickImage = async () => {
    try {
      setShowFileTypeModal(false);
      
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: "error",
          text1: "Permission Required",
          text2: "Sorry, we need camera roll permissions to select images.",
        });
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        base64: false,
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileInfo: FileInfo = {
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          uri: asset.uri,
          type: 'image',
          mimeType: asset.mimeType || 'image/jpeg',
        };
        
        console.log("Uploading image:", fileInfo);
        await handleFileUpload(selectedRequirement, fileInfo);
      }
    } catch (err) {
      console.log("Image picker error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick image: " + (err instanceof Error ? err.message : "Unknown error"),
      });
    }
  };

  // Handle file upload to server
  const handleFileUpload = async (reqId: string | null, fileInfo: FileInfo) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      console.log("Starting file upload for requirement:", reqId);
      console.log("File info:", fileInfo);

      if (!user?.id || !reqId) {
        throw new Error("Missing user ID or requirement ID");
      }

      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("requirement_id", reqId);

      // Create a unique filename
      const timestamp = Date.now();
      const safeName = fileInfo.name 
        ? fileInfo.name.replace(/[^a-zA-Z0-9_\-\s()]/g, "_")
        : `file_${timestamp}`;
      
      // Determine file extension based on mimeType or filename
      let fileExtension = 'file';
      if (fileInfo.mimeType) {
        if (fileInfo.mimeType.includes('pdf')) fileExtension = 'pdf';
        else if (fileInfo.mimeType.includes('jpeg') || fileInfo.mimeType.includes('jpg')) fileExtension = 'jpg';
        else if (fileInfo.mimeType.includes('png')) fileExtension = 'png';
        else if (fileInfo.mimeType.includes('gif')) fileExtension = 'gif';
        else if (fileInfo.mimeType.includes('word')) fileExtension = 'docx';
        else if (fileInfo.mimeType.includes('msword')) fileExtension = 'doc';
      } else if (fileInfo.name) {
        fileExtension = fileInfo.name.split('.').pop() || 'file';
      }
      
      const fileName = `${safeName}_${timestamp}.${fileExtension}`;

      console.log("Preparing to append file to FormData");
      console.log("File URI:", fileInfo.uri);
      console.log("File name:", fileName);
      console.log("File type:", fileInfo.mimeType);

      // Append the file with proper structure for React Native
      const fileObject = {
        uri: fileInfo.uri,
        name: fileName,
        type: fileInfo.mimeType || 'application/octet-stream',
      };
      
      console.log("File object for FormData:", fileObject);
      
      formData.append("file", fileObject as any);

      console.log("FormData prepared, sending to server...");
      console.log("Upload URL: https://msis.eduisync.io/api/upload_requirement.php");

      const response = await axios.post(
        "https://msis.eduisync.io/api/upload_requirement.php",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              const finalProgress = Math.min(progress, 99);
              setUploadProgress(finalProgress);
              console.log("Upload progress:", finalProgress + "%");
            }
          },
        }
      );

      console.log("Upload response:", response.data);

      if (response.data.success) {
        setUploadProgress(100);
        console.log("Upload successful, refreshing requirements...");
        await refreshRequirements();
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "File uploaded successfully",
        });
      } else {
        console.log("Upload failed with server response:", response.data);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.data.message || "Failed to upload file",
        });
      }
    } catch (err) {
      console.error("Upload error details:", err);
      let errorMessage = "Failed to upload file. Please try again.";
      
      if (err && typeof err === 'object' && 'response' in err) {
        console.error("Server response error:", (err as any).response?.data);
        errorMessage = (err as any).response?.data?.message || errorMessage;
      } else if (err && typeof err === 'object' && 'request' in err) {
        console.error("No response received:", (err as any).request);
        errorMessage = "No response from server. Please check your connection.";
      } else if (err instanceof Error && err.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection.";
      } else if (err instanceof Error && err.message?.includes('timeout')) {
        errorMessage = "Upload timeout. Please try again.";
      }
      
      console.error("Final error message:", errorMessage);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (reqId: string, fileId: string, fileName: string) => {
    setRequirementToDelete(reqId);
    setFileToDelete({ id: fileId, name: fileName } as UploadedFile);
    setShowDeleteModal(true);
  };

  // Handle file removal
  const handleRemoveFile = async () => {
    try {
      if (!user?.id || !requirementToDelete || !fileToDelete?.id) {
        throw new Error("Missing required data for file removal");
      }

      const response = await axios.post(
        "https://msis.eduisync.io/api/delete_requirement.php",
        {
          user_id: user.id,
          requirement_id: requirementToDelete,
          file_id: fileToDelete.id,
        }
      );

      if (response.data.success) {
        await refreshRequirements();
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "File removed successfully",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.data.message || "Failed to remove file",
        });
      }
    } catch (err) {
      console.error("Delete error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to remove file. Please try again.",
      });
    } finally {
      setShowDeleteModal(false);
      setFileToDelete(null);
      setRequirementToDelete(null);
    }
  };

  // Handle download all files as one PDF
  const handleDownloadAll = async () => {
    try {
      setPrintingFiles(true);
      
      const allFiles = requirements.flatMap(req => 
        req.uploadedFiles.map(file => ({ ...file, requirementId: req.id, requirementName: req.name }))
      );
      
      if (allFiles.length === 0) {
        Toast.show({
          type: "info",
          text1: "No Files",
          text2: "No files available to download",
        });
        return;
      }

      Toast.show({
        type: "info",
        text1: "Compiling PDF",
        text2: `Combining ${allFiles.length} files into one PDF...`,
      });

      // Try to call API to compile all files into one PDF
      try {
        if (!user?.id) {
          throw new Error("User ID not available");
        }

        const response = await axios.post(
          "https://msis.eduisync.io/api/generate_compiled_pdf.php",
          {
            user_id: user.id,
            files: allFiles.map(file => ({
              requirement_id: file.requirementId,
              requirement_name: file.requirementName,
              file_id: file.id,
              file_name: file.name,
              file_path: (file as any).file_path
            }))
          },
          {
            timeout: 60000,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (response.data.success && response.data.pdf_url) {
          // Download the compiled PDF
          const pdfFileName = `Student_Requirements_${user.first_name}_${user.last_name}_${Date.now()}.pdf`;
          const pdfUri = FileSystem.documentDirectory + pdfFileName;
          
          await FileSystem.downloadAsync(response.data.pdf_url, pdfUri);
          
          // Share the compiled PDF
          await Sharing.shareAsync(pdfUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Download Compiled Requirements PDF',
          });

          Toast.show({
            type: "success",
            text1: "PDF Ready",
            text2: `All files compiled into one PDF successfully`,
          });
          return;
        }
      } catch (apiError) {
        console.log("PDF compilation API not available, falling back to individual downloads");
      }

      // Fallback: Download all files individually
      Toast.show({
        type: "info",
        text1: "Downloading Files",
        text2: `Preparing ${allFiles.length} files for download...`,
      });

      const downloadPromises = allFiles.map(async (file) => {
        try {
          if (!user?.id) return null;
          const downloadUrl = `https://msis.eduisync.io/api/get_requirement_file.php?user_id=${user.id}&requirement_id=${file.requirementId}&file_path=${encodeURIComponent((file as any).file_path)}`;
          const fileUri = FileSystem.documentDirectory + file.name;
          const { uri } = await FileSystem.downloadAsync(downloadUrl, fileUri);
          return uri;
        } catch (error) {
          console.error(`Error downloading ${file.name}:`, error);
          return null;
        }
      });

      const downloadedFileUris = (await Promise.all(downloadPromises)).filter(Boolean);
      
      if (downloadedFileUris.length === 0) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to download files",
        });
        return;
      }

      // Share files one by one (Expo Sharing limitation)
      for (let i = 0; i < downloadedFileUris.length; i++) {
        const uri = downloadedFileUris[i];
        if (uri) {
          await Sharing.shareAsync(uri, {
            dialogTitle: `File ${i + 1} of ${downloadedFileUris.length}`,
          });
        }
      }

      Toast.show({
        type: "success",
        text1: "Download Complete",
        text2: `${downloadedFileUris.length} files downloaded successfully`,
      });
    } catch (error) {
      console.error("Error in download process:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to download files",
      });
    } finally {
      setPrintingFiles(false);
    }
  };

  // View file handler
  const handleViewFile = async (file: any, requirementId: string) => {
    try {
      if (!user?.id) {
        throw new Error("User ID not available");
      }

      if (file.type === "image") {
        const imageUrl = `https://msis.eduisync.io/api/get_requirement_file.php?user_id=${user.id}&requirement_id=${requirementId}&file_path=${encodeURIComponent(file.file_path)}`;
        setViewingImage(imageUrl);
      } else {
        setDownloadingFile(file.name);
        const downloadUrl = `https://msis.eduisync.io/api/get_requirement_file.php?user_id=${user.id}&requirement_id=${requirementId}&file_path=${encodeURIComponent(file.file_path)}`;
        const fileUri = FileSystem.documentDirectory + file.name;
        const { uri } = await FileSystem.downloadAsync(downloadUrl, fileUri);
        await Sharing.shareAsync(uri);
        setDownloadingFile(null);
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      setDownloadingFile(null);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not open the file. Please try again.",
      });
    }
  };

  // Download file handler
  const handleDownloadFile = async (file: any, requirementId: string) => {
    try {
      if (!user?.id) {
        throw new Error("User ID not available");
      }

      setDownloadingFile(file.name);
      const downloadUrl = `https://msis.eduisync.io/api/get_requirement_file.php?user_id=${user.id}&requirement_id=${requirementId}&file_path=${encodeURIComponent(file.file_path)}`;
      const fileUri = FileSystem.documentDirectory + file.name;
      const { uri } = await FileSystem.downloadAsync(downloadUrl, fileUri);

      await Sharing.shareAsync(uri, {
        mimeType: file.mimeType,
        dialogTitle: `Download ${file.name}`,
        UTI: file.uti,
      });
      setDownloadingFile(null);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "File downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      setDownloadingFile(null);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not download the file. Please try again.",
      });
    }
  };

  const FileIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "pdf":
      return <Image source={require("../../assets/images/pdf.png")} className="w-6 h-6" />;
    case "word":
    case "docs":
    case "docsx":
      return <Image source={require("../../assets/images/docs.png")} className="w-6 h-6"/>;
    case "png":
      return <Image source={require("../../assets/images/png.png")}  className="w-6 h-6"/>;
    case "jpg":
      return <Image source={require("../../assets/images/jpg.png")} className="w-6 h-6" />;
    default:
      return <Image source={require("../../assets/images/jpg.png")} className="w-6 h-6" />;
  }
};

  // Skeleton loader component
  const SkeletonLoader = () => {
    return (
      <View className="flex-1 bg-white p-4" style={{ backgroundColor }}>
        {/* Header Skeleton */}
        <View className="mb-6">
          <View className="h-8 bg-gray-200 rounded w-3/4 mb-2" style={{ backgroundColor: loadColor }}></View>
          <View className="h-4 bg-gray-200 rounded w-full" style={{ backgroundColor: loadColor }}></View>
        </View>

        {/* Search Bar Skeleton */}
        <View className="h-12 bg-gray-200 rounded-lg mb-4" style={{ backgroundColor: loadColor }}></View>

        {/* Stats Cards Skeleton */}
        <View className="flex-row justify-between mb-4 gap-1" >
          <View className="bg-gray-200 rounded-lg p-4 w-1/3 items-center shadow-md" style={{ backgroundColor: loadColor }}>
            <View className="h-4 bg-gray-300 rounded w-3/4 mb-2" style={{ backgroundColor: loadColor }}></View>
            <View className="h-8 bg-gray-300 rounded w-1/2" style={{ backgroundColor: loadColor }} ></View>
          </View>
          <View className="bg-gray-200 rounded-lg p-4 w-1/3 items-center shadow-md " style={{ backgroundColor: loadColor }}>
            <View className="h-4 bg-gray-300 rounded w-3/4 mb-2" style={{ backgroundColor: loadColor }}></View>
            <View className="h-8 bg-gray-300 rounded w-1/2" style={{ backgroundColor: loadColor }}></View>
          </View>
          <View className="bg-gray-200 rounded-lg p-4 w-1/3 items-center shadow-md" style={{ backgroundColor: loadColor }}>
            <View className="h-4 bg-gray-300 rounded w-3/4 mb-2" style={{ backgroundColor: loadColor }}></View>
            <View className="h-8 bg-gray-300 rounded w-1/2" style={{ backgroundColor: loadColor }}></View>
          </View>
        </View>

        {/* Filter Row Skeleton */}
        <View className="flex-row items-center gap-3 justify-between mb-4">
          <View className="h-10 bg-gray-200 rounded-lg w-1/3" style={{ backgroundColor: loadColor }}></View>
          <View className="h-10 bg-gray-200 rounded-lg w-2/3" style={{ backgroundColor: loadColor }}></View>
        </View>

        {/* Requirements List Skeleton */}
        <ScrollView className="mb-6">
          {[1, 2, 3].map((item) => (
            <View
              key={item}
              style={{ backgroundColor: loadColor }}
              className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4"
            >
              <View className="flex-row justify-between items-start mb-4">
                <View className="h-6 bg-gray-200 rounded w-3/4" style={{ backgroundColor: loadColor }}></View>
                <View className="w-6 h-6 bg-gray-200 rounded-md" style={{ backgroundColor: loadColor }}></View>
              </View>
              <View>
                <View className="flex-row justify-between items-center mb-4">
                  <View className="h-4 bg-gray-200 rounded w-1/3" style={{ backgroundColor: loadColor }}></View>
                  <View className="h-4 bg-gray-200 rounded w-1/6" style={{ backgroundColor: loadColor }}></View>
                </View>
                <View className="h-16 bg-gray-100 rounded-lg mb-2" style={{ backgroundColor: loadColor }}></View>
                <View className="items-end mt-2">
                  <View className="h-10 bg-gray-200 rounded-lg w-32" style={{ backgroundColor: loadColor }}></View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Retry fetching requirements
  const retryFetch = () => {
    setLoading(true);
    setError(null);
    fetchRequirements();
  };

  // Loading state
  if (loading && !refreshing) {
    return <SkeletonLoader />;
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 bg-white p-4 justify-center items-center">
        <Text className="text-red-500 mb-4 text-center">Error: {error}</Text>
        <TouchableOpacity
          className="bg-[#be2e2e] px-4 py-2 rounded-lg"
          onPress={retryFetch}
        >
          <Text className="text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <ScrollView
        className="p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#be2e2e"]}
            tintColor="#be2e2e"
            progressBackgroundColor="#ffffff"
            progressViewOffset={20}
          />
        }
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View className="mb-6">
          
          <Text style={{ color: mutedColor, marginTop: 4 }}>
            Upload all required documents. Please ensure all files are clear and
            legible.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={{ backgroundColor: cardColor }} className="flex-row items-center bg-white rounded-lg px-4 py-0 shadow-sm mb-4 border-2 border-gray-300 ">
          <Search size={20} color="#6b7280" />
          <TextInput
            style={{ marginLeft: 8, color: textColor, flex: 1, fontSize: 16 }}
            placeholder="Search requirements..."
            placeholderTextColor={mutedColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Stats Cards */}
        <View className="flex-row justify-between mb-4 gap-1">
          <View style={{ backgroundColor: cardColor, borderRadius: 8, padding: 16, width: '33%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
            <Text className="text-gray-500 text-sm">Requirements</Text>
            <Text  className="text-2xl" style={{ fontWeight: 'bold', color: textColor }}>
              {totalCount}
            </Text>
          </View>
          <View className="bg-white rounded-lg p-4 w-1/3 items-center shadow-md" style={{ backgroundColor: cardColor, borderRadius: 8, padding: 16, width: '33%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
            <Text className="text-gray-500 text-sm">Completed</Text>
            <Text className="text-2xl font-bold text-gray-800" style={{ fontSize: 24, fontWeight: 'bold', color: textColor }}>
              {completedCount}
            </Text>
          </View>
          <View className="bg-white rounded-lg p-4 w-1/3 items-center shadow-md" style={{ backgroundColor: cardColor, borderRadius: 8, padding: 16, width: '33%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
            <Text className="text-gray-500 text-sm" >Completion</Text>
            <Text className="text-2xl font-bold text-green-600" >
              {completionPercentage}%
            </Text>
          </View>
        </View>

        {/* Download and Filter Row */}
        <View className="flex-row items-center gap-3 justify-between mb-4">
          {/* Download All Button */}
          <TouchableOpacity
            className={`px-5 py-2 rounded-lg flex-row items-center justify-center ${
              printingFiles ? "bg-gray-400" : "bg-[#be2e2e]"
            }`}
            onPress={() => setShowDownloadConfirmModal(true)}
            disabled={printingFiles}
          >
            {printingFiles ? (
              <ActivityIndicator size={16} color="white" />
            ) : (
              <Download size={16} color="white" />
            )}
            <Text className="text-white ml-2 text-xs font-medium">
              {printingFiles ? "Compiling..." : "Download All"}
            </Text>
          </TouchableOpacity>

          {/* Filter Dropdown */}
          <View className="flex-1 relative">
            <Pressable
              style={{ backgroundColor:cardColor }}
              className="bg-white border border-gray-200 py-2 px-4 rounded-lg flex-row items-center justify-between h-10"
              onPress={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Text className="text-gray-700 text-xs" style={{ color: textColor}}>
                {filter === "all"
                  ? "All"
                  : filter === "completed"
                    ? "Completed"
                    : "Not Completed"}
              </Text>
              <ChevronDown size={16} color="#6b7280" />
            </Pressable>

            {showFilterDropdown && (
              <View className="absolute top-10 right-0 left-0 bg-white border border-gray-200 rounded-lg shadow-md z-10">
                <Pressable
                  className="py-2 px-4 border-b border-gray-100"
                  onPress={() => {
                    setFilter("all");
                    setShowFilterDropdown(false);
                  }}
                >
                  <Text className="text-gray-700 text-xs">All</Text>
                </Pressable>
                <Pressable
                  className="py-2 px-4 border-b border-gray-100"
                  onPress={() => {
                    setFilter("completed");
                    setShowFilterDropdown(false);
                  }}
                >
                  <Text className="text-gray-700 text-xs">Completed</Text>
                </Pressable>
                <Pressable
                  className="py-2 px-4"
                  onPress={() => {
                    setFilter("not-completed");
                    setShowFilterDropdown(false);
                  }}
                >
                  <Text className="text-gray-700 text-xs">Not Completed</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Requirements List */}
        {filteredRequirements.length === 0 ? (
          <View style={{ backgroundColor: cardColor }} className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 items-center justify-center">
            <Image source={require("../../assets/images/no_file.png")} className="w-20 h-20"/>
            <Text className="text-gray-500 text-center">
              No requirements found
            </Text>
          </View>
        ) : (
          filteredRequirements.map((req) => (
            <View
              key={req.id}
              style={{ backgroundColor: cardColor }}
              className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4"
            >
              {/* Requirement Info */}
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="font-bold text-gray-800 text-lg" style={{ color: textColor }}>
                    {req.name}
                  </Text>
                </View>
                <View
                  className={`w-6 h-6 rounded-md flex items-center justify-center ${req.completed ? "bg-green-500" : "bg-gray-100 border border-gray-300"}`}
                >
                  {req.completed && <Check size={16} color="white" />}
                </View>
              </View>

              {/* Files Section */}
              <View>
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="font-medium text-gray-800 text-sm" style={{ color: textColor }}>
                    Required: {req.file_count} files
                  </Text>
                  <Text
                    className={`text-sm ${req.uploadedFiles.length >= req.file_count ? "text-green-500" : "text-red-400"}`}
                  >
                    {req.uploadedFiles.length}/{req.file_count}
                  </Text>
                </View>

                {req.uploadedFiles.length > 0 ? (
                  req.uploadedFiles.map((file) => (
                    <View
                      key={file.id}
                      style={{ backgroundColor: cardColor }}
                      className="flex-row items-center justify-between bg-white p-3 rounded-lg mb-2 border border-gray-200"
                    >
                      {/* File Info with Status */}
                      <View className="flex-row items-center flex-1">
                        {/* Status Indicator */}
                      <View
                        className={`w-2 h-8 rounded-l ${
                          file.status === "approved"
                            ? "bg-green-500"
                            : file.status === "pending"
                              ? "bg-orange-500"
                              : file.status === "rejected"
                                ? "bg-red-500"
                                : "bg-gray-400"
                        }`}
                      />


                        <View className="flex-row items-center flex-1 ml-2">
                          <View
                               className={`p-2 rounded ${
                              file.status === "approved"
                                ? "bg-green-50"
                                : file.status === "pending"
                                  ? "bg-orange-50"
                                  : file.status === "rejected"
                                    ? "bg-red-50"
                                    : "bg-gray-50"
                            }`}
                          >
                            <FileIcon type={file.type} />
                          </View>

                          <View className="ml-3 flex-1">
                            <Text
                              style={{ color: textColor }}
                              className="text-gray-800 text-sm font-medium"
                              numberOfLines={1}
                            >
                              {file.name}
                            </Text>
                            <View className="flex-row items-center mt-1">
                              <Text className="text-gray-500 text-xs mr-2" style={{ color: textColor }}>
                                {file.size}
                              </Text>
                              <TouchableOpacity
                                className={`px-2 py-1 rounded-full flex-row items-center ${
                                  file.status === "approved"
                                    ? "bg-green-100"
                                    : file.status === "pending"
                                      ? "bg-orange-100"
                                      : file.status === "rejected"
                                        ? "bg-red-100"
                                        : "bg-gray-100"
                                }`}
                                onPress={() => {
                                  if (file.status === "rejected" && file.feedback) {
                                    setSelectedFeedback(file.feedback);
                                    setShowFeedbackModal(true);
                                  }
                                }}
                                disabled={file.status !== "rejected" || !file.feedback}
                              >
                                <Text
                                  className={`text-xs mr-1 font-medium ${
                                    file.status === "approved"
                                      ? "text-green-800"
                                      : file.status === "pending"
                                        ? "text-orange-800"
                                        : file.status === "rejected"
                                          ? "text-red-800"
                                          : "text-gray-800"
                                  }`}
                                >
                                  {file.status === "approved"
                                    ? "Approved"
                                    : file.status === "pending"
                                      ? "Pending"
                                      : file.status === "rejected"
                                        ? "Rejected"
                                        : file.status || "Uploaded"}
                                </Text>
                                {file.status === "rejected" && file.feedback && (
                                  <Info size={12} color="#991b1b" className="ml-3 " />
                                )}
                              </TouchableOpacity>

                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View className="flex-row">
                        <TouchableOpacity
                          className="p-2 mr-1 rounded-lg hover:bg-gray-100"
                          onPress={() => handleViewFile(file, req.id)}
                        >
                          <Eye size={16} color="#6b7280" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="p-2 mr-1 rounded-lg hover:bg-gray-100"
                          onPress={() => handleDownloadFile(file, req.id)}
                        >
                          <Download size={16} color="#3b82f6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="p-2 rounded-lg hover:bg-gray-100"
                          onPress={() => openDeleteModal(req.id, file.id, file.name)}
                        >
                          <X size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={{ backgroundColor: cardColor }} className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 items-center justify-center">
                    <Image source={require("../../assets/images/no_file.png")} className="w-20 h-20"/>
                    <Text className="text-gray-500 text-center mt-2 text-sm">
                      No files uploaded yet
                    </Text>
                  </View>
                )}

                {req.uploadedFiles.length < req.file_count && (
                  <View className="items-end mt-2">
                    <TouchableOpacity
                      className="bg-[#be2e2e] border border-gray-300 rounded-lg shadow-md py-2 px-4 flex-row items-center justify-center w-32"
                      onPress={() => openFileTypeModal(req.id)}
                      disabled={uploading}
                    >
                      <Text className="text-white text-xs font-medium ml-2">
                        Browse Files
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* File Type Selection Modal */}
      <Modal
        visible={showFileTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFileTypeModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-lg p-6 w-full max-w-md">
            <Text className="text-xl font-bold text-gray-800 mb-2">
              Select File Type
            </Text>
            <Text className="text-gray-600 mb-3">
              Choose the type of file you want to upload
            </Text>

            <View className="flex-row gap-5 justify-center">
            <TouchableOpacity
              className="bg-blue-100 p-4 rounded-lg items-center w-32"
              onPress={pickDocument}
            >
              <View className="flex-row gap-3 justify-center w-full mb-1">
                <Image source={require("../../assets/images/pdf.png")} className="w-6 h-6" />
                <Image source={require("../../assets/images/docs.png")} className="w-6 h-6" />
              </View>
              <Text className="text-red-800 mt-2 text-center">Document</Text>
              <Text className="text-red-600 text-xs text-center">
                PDF, Word
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-purple-100 p-4 rounded-lg items-center w-32"
              onPress={pickImage}
            >
              <View className="flex-row justify-center gap-3 w-full mb-1">
                <Image source={require("../../assets/images/jpg.png")} className="w-6 h-6" />
                <Image source={require("../../assets/images/png.png")} className="w-6 h-6" />
              </View>
              <Text className="text-red-800 mt-2 text-center">Image</Text>
              <Text className="text-red-600 text-xs text-center">
                JPG, PNG
              </Text>
            </TouchableOpacity>
          </View>
            <TouchableOpacity
              className="mt-6 bg-gray-200 py-3 rounded-lg"
              onPress={() => setShowFileTypeModal(false)}
            >
              <Text className="text-gray-800 text-center font-medium">
                Cancel
                </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Download Confirmation Modal */}
      <Modal
        visible={showDownloadConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDownloadConfirmModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-md">
            <View className="items-center mb-4">
              <View className="bg-blue-100 p-4 rounded-full">
                <Download size={32} color="#3b82f6" />
              </View>
            </View>
            
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              Download All Files
            </Text>
            
            <Text className="text-gray-600 text-center mb-6">
              This will download all your uploaded files. Are you sure you want to proceed?
            </Text>

            <View className="flex-row justify-between gap-4">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-4 rounded-lg"
                onPress={() => setShowDownloadConfirmModal(false)}
              >
                <Text className="text-gray-800 text-center font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-[#be2e2e] py-4 rounded-lg flex-row items-center justify-center"
                onPress={() => {
                  setShowDownloadConfirmModal(false);
                  handleDownloadAll();
                }}
              >
                <Download size={18} color="white" />
                <Text className="text-white text-center font-medium ml-2">
                  Download
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-md">
            <View className="items-center mb-4">
              <View className="bg-red-100 p-4 rounded-full">
                <AlertTriangle size={32} color="#ef4444" />
              </View>
            </View>
            
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              Delete File
            </Text>
            
            <Text className="text-gray-600 text-center mb-6">
              Are you sure you want to delete{' '}
              <Text className="font-semibold">"{fileToDelete?.name}"</Text>?
              This action cannot be undone.
            </Text>

            <View className="flex-row justify-between gap-4">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-4 rounded-lg"
                onPress={() => setShowDeleteModal(false)}
              >
                <Text className="text-gray-800 text-center font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-red-600 py-4 rounded-lg flex-row items-center justify-center"
                onPress={handleRemoveFile}
              >
                <Trash2 size={18} color="white" />
                <Text className="text-white text-center font-medium ml-2">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Upload Progress Modal */}
      <Modal visible={uploading} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-lg p-6 w-full max-w-md items-center">
            <ActivityIndicator size="large" color="#be2e2e" />
            <Text className="text-gray-800 text-lg font-medium mt-4">
              Uploading File
            </Text>
            <Text className="text-gray-600 mt-2">
              {uploadProgress}% complete
            </Text>
            <View className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <View
                className="bg-[#be2e2e] h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Download Progress Modal */}
      <Modal
        visible={downloadingFile !== null}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-lg p-6 w-full max-w-md items-center">
            <ActivityIndicator size="large" color="#be2e2e" />
            <Text className="text-gray-800 text-lg font-medium mt-4">
              Downloading File
            </Text>
            <Text className="text-gray-600 mt-2 text-center">
              {downloadingFile}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Enhanced Image View Modal */}
      <Modal
        visible={viewingImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setViewingImage(null);
          imageScale.setValue(1);
          imageRotation.setValue(0);
          setCurrentRotation(0);
          setCurrentScale(1);
        }}
      >
        <View className="flex-1 bg-black/90 items-center justify-center">
          {/* Control Buttons */}
          <View className="absolute top-12 left-4 right-4 flex-row justify-between items-center z-10">
            <TouchableOpacity
              className="bg-white/20 p-3 rounded-full"
              onPress={() => {
                setViewingImage(null);
                imageScale.setValue(1);
                imageRotation.setValue(0);
                setCurrentRotation(0);
                setCurrentScale(1);
              }}
            >
              <X size={24} color="white" />
            </TouchableOpacity>
            
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="bg-white/20 p-3 rounded-full"
                onPress={() => {
                  const newScale = Math.min(currentScale + 0.5, 3);
                  setCurrentScale(newScale);
                  Animated.spring(imageScale, {
                    toValue: newScale,
                    useNativeDriver: true,
                  }).start();
                }}
              >
                <ZoomIn size={20} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-white/20 p-3 rounded-full"
                onPress={() => {
                  const newScale = Math.max(currentScale - 0.5, 0.5);
                  setCurrentScale(newScale);
                  Animated.spring(imageScale, {
                    toValue: newScale,
                    useNativeDriver: true,
                  }).start();
                }}
              >
                <ZoomOut size={20} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-white/20 p-3 rounded-full"
                onPress={() => {
                  const newRotation = currentRotation + 90;
                  setCurrentRotation(newRotation);
                  Animated.spring(imageRotation, {
                    toValue: newRotation,
                    useNativeDriver: true,
                  }).start();
                }}
              >
                <RotateCcw size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Image Container */}
          <View className="flex-1 w-full items-center justify-center p-4">
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                // Tap to zoom
                const newScale = currentScale === 1 ? 2 : 1;
                setCurrentScale(newScale);
                Animated.spring(imageScale, {
                  toValue: newScale,
                  useNativeDriver: true,
                }).start();
              }}
              className="w-full h-4/5"
            >
              <Animated.View
                style={{
                  transform: [
                    { scale: imageScale },
                    { rotate: imageRotation.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg']
                    }) }
                  ]
                }}
                className="w-full h-full"
              >
                {viewingImage && (
                  <Image
                    source={{ uri: viewingImage }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-md">
            <View className="items-center mb-4">
              <View className="bg-red-100 p-4 rounded-full">
                <AlertTriangle size={32} color="#ef4444" />
              </View>
            </View>
            
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              Rejection Feedback
            </Text>
            
            <Text className="text-gray-600 text-center mb-4">
              Reason for rejection:
            </Text>
            
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <Text className="text-red-800 text-sm leading-5">
                {selectedFeedback}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-[#be2e2e] py-4 rounded-lg"
              onPress={() => setShowFeedbackModal(false)}
            >
              <Text className="text-white text-center font-medium">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
}