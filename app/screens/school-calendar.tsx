import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { API_BASE_URL } from '@/constants/Config';
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ChevronLeft, Download, Eye, ImageIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AcademicCalendar {
  id: number;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  file_path: string | null;
  year_level: string | null;
  created_at: string;
  updated_at: string;
  documents?: AcademicCalendarDocument[];
}

interface AcademicCalendarDocument {
  id: number;
  academic_calendar_id: number;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

interface SchoolCalendarResponse {
  success: boolean;
  student: {
    id: string;
    student_id: string;
    first_name: string;
    last_name: string;
    academic_year: string;
    program: string;
    year_level: string;
  };
  academic_calendars: AcademicCalendar[];
  error?: string;
}

const FileIcon = ({ mimeType }: { mimeType: string }) => {
  if (mimeType.includes("pdf")) {
    return (
      <Image
        source={require("../../assets/images/pdf.png")}
        className="w-6 h-6"
      />
    );
  } else if (mimeType.includes("word") || mimeType.includes("document")) {
    return (
      <Image
        source={require("../../assets/images/docs.png")}
        className="w-6 h-6"
      />
    );
  } else if (mimeType.includes("png")) {
    return (
      <Image
        source={require("../../assets/images/png.png")}
        className="w-6 h-6"
      />
    );
  } else if (
    mimeType.includes("jpg") ||
    mimeType.includes("jpeg") ||
    mimeType.includes("image")
  ) {
    return (
      <Image
        source={require("../../assets/images/jpg.png")}
        className="w-6 h-6"
      />
    );
  } else {
    return (
      <Image
        source={require("../../assets/images/jpg.png")}
        className="w-6 h-6"
      />
    );
  }
};

const SchoolCalendar: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Theme Change 
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  const loadColor = useThemeColor({}, 'loaderCard');
  
  // Enhanced navigation detection
  const hasThreeButtonNav = React.useMemo(() => {
    if (Platform.OS === 'ios') {
      return insets.bottom > 20; // iOS home indicator
    }
    return insets.bottom > 0; // Android three-button nav
  }, [insets.bottom]);

  const isGestureNav = React.useMemo(() => {
    return Platform.OS === 'android' && insets.bottom === 0;
  }, [insets.bottom]);

  const [calendarData, setCalendarData] =
    useState<SchoolCalendarResponse | null>(null);
  const [filteredCalendars, setFilteredCalendars] = useState<
    AcademicCalendar[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<AcademicCalendarDocument | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [fileSystemAvailable, setFileSystemAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if FileSystem is available
  useEffect(() => {
    const checkFileSystem = async () => {
      try {
        if (!FileSystem || typeof FileSystem.getInfoAsync !== "function") {
          setFileSystemAvailable(false);
          console.warn("FileSystem module not available");
        } else {
          await FileSystem.getInfoAsync(FileSystem.cacheDirectory + "test");
          setFileSystemAvailable(true);
        }
      } catch (error) {
        console.warn("FileSystem not available:", error);
        setFileSystemAvailable(false);
      }
    };

    checkFileSystem();
  }, []);

  const fetchCalendarData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      if (!user?.id) {
        throw new Error("User ID not found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/school-calendar/get_school_calendar.php?user_id=${user.id}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Server error: ${response.status} ${response.statusText}. ${errorText}`
        );
      }

      const data: SchoolCalendarResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch calendar data");
      }

      setCalendarData(data);

      // Use the calendars returned by the API
      if (data.academic_calendars && data.academic_calendars.length > 0) {
        setFilteredCalendars(data.academic_calendars);
      } else {
        setFilteredCalendars([]);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch calendar data";
      setError(errorMessage);

      if (!errorMessage.includes("500")) {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchCalendarData(true);
  };

  useEffect(() => {
    fetchCalendarData();
  }, [user]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatYearLevel = (yearLevel: string | null) => {
    if (!yearLevel) return "All Years";
    return yearLevel
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const downloadAndOpenFile = async (
    document: AcademicCalendarDocument,
    calendarId: number
  ) => {
    try {
      setDownloading(document.id);

      if (!fileSystemAvailable) {
        await viewDocumentInBrowser(document, calendarId);
        return;
      }

      const fileUri = `${FileSystem.cacheDirectory}${document.file_name}`;

      const downloadUrl = `${API_BASE_URL}/api/school-calendar/download_file.php?user_id=${user?.id}&calendar_id=${calendarId}&file_path=${encodeURIComponent(document.file_path)}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${progress * 100}%`);
        }
      );

      const result = await downloadResumable.downloadAsync();
      const uri = result?.uri;

      if (!uri) {
        throw new Error("Download failed");
      }

      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error("Downloaded file not found");
      }

      if (Platform.OS === "android") {
        try {
          const contentUri = await FileSystem.getContentUriAsync(uri);
          await IntentLauncher.startActivityAsync(
            "android.intent.action.VIEW",
            {
              data: contentUri,
              flags: 1,
              type: document.mime_type,
            }
          );
        } catch (intentError) {
          console.error("Intent error:", intentError);
          await Linking.openURL(uri);
        }
      } else {
        await Linking.openURL(uri);
      }
    } catch (error) {
      console.error("Error downloading/opening file:", error);
      Alert.alert(
        "Error",
        "Failed to download file. Trying to open in browser..."
      );
      await viewDocumentInBrowser(document, calendarId);
    } finally {
      setDownloading(null);
    }
  };

  const viewDocumentInBrowser = async (
    document: AcademicCalendarDocument,
    calendarId: number
  ) => {
    try {
      const url = `${API_BASE_URL}/api/school-calendar/download_file.php?user_id=${user?.id}&calendar_id=${calendarId}&file_path=${encodeURIComponent(document.file_path)}`;
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Error opening document in browser:", error);
      Alert.alert("Error", "Failed to open document");
    }
  };

  const viewDocument = (document: AcademicCalendarDocument) => {
    setSelectedDocument(document);
    setViewerVisible(true);
  };

  const SkeletonLoader = () => {
    return (
      <View className="flex-1 bg-gray-100" style={{ backgroundColor }}>
        <View className="bg-[#af1616] pt-12 pb-4 px-5 flex-row items-center">
          <View className="h-6 w-6 bg-[#af1616]-light rounded mr-3"></View>
          <View className="h-6 bg-[#af1616]-light rounded w-40"></View>
        </View>
        <View className="p-5">
          {[1, 2, 3].map((item) => (
            <View key={item} className="bg-white p-4 rounded-lg shadow mb-4" style={{ backgroundColor: cardColor }}>
              <View className="h-6 bg-gray-300 rounded w-3/4 mb-3" style={{ backgroundColor: loadColor }}></View>
              <View className="h-4 bg-gray-300 rounded w-1/2 mb-2" style={{ backgroundColor: loadColor }}></View>
              <View className="h-4 bg-gray-300 rounded w-2/3 mb-4" style={{ backgroundColor: loadColor }}></View>
              <View className="h-12 bg-gray-200 rounded" style={{ backgroundColor: loadColor }}></View>
            </View>
          ))}
        </View>
      </View>
    );
  };
  const ErrorState = () => (
    <View className="flex-1 justify-center items-center p-5 bg-gray-100">
      <Ionicons
        name="alert-circle"
        size={48}
        color="#dc2626"
        className="mb-4"
      />
      <Text className="text-gray-600 mb-2 text-center">
        Failed to load calendar data
      </Text>
      <Text className="text-gray-500 mb-4 text-center text-sm">{error}</Text>
      <TouchableOpacity
        onPress={() => fetchCalendarData()}
        className="bg-[#af1616] px-4 py-2 rounded flex-row items-center"
      >
        <Ionicons name="refresh" size={16} color="white" className="mr-2" />
        <Text className="text-white">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return <ErrorState />;
  }

  if (!calendarData) {
    return (
      <View className="flex-1 bg-gray-100" style={{ backgroundColor }}>
        <View className=" pt-12 pb-4 px-5 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">School Calendar</Text>
        </View>
        <View className="flex-1 justify-center items-center p-8">
          <View className="bg-white rounded-2xl p-8 items-center shadow-lg" style={{ backgroundColor: cardColor }}>
            <View className="bg-gray-100 rounded-full p-6 mb-4" style={{ backgroundColor: loadColor }}>
              <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
            </View>
            <Text className="text-xl font-bold text-gray-800 mb-2 text-center" style={{ color: textColor }}>
              No Calendar Data
            </Text>
            <Text className="text-gray-500 text-center mb-6" style={{ color: mutedColor }}>
              There are no academic calendars available at the moment.
            </Text>
            <TouchableOpacity
              onPress={() => fetchCalendarData()}
              className="bg-[#af1616] px-8 py-3 rounded-xl flex-row items-center shadow-sm"
            >
              <Ionicons name="refresh" size={20} color="white" className="mr-2" />
              <Text className="text-white font-semibold ml-2">Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100" style={{ backgroundColor }}>
      <View className=" pt-12 pb-4 px-5 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={24}  />
        </TouchableOpacity>
        <Text className="text-xl font-bold">School Calendar</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#af1616"]}
            tintColor={"#af1616"}
          />
        }
        contentContainerStyle={{ 
          paddingBottom: hasThreeButtonNav ? insets.bottom + 16 : isGestureNav ? 24 : 16 
        }}
      >
        <View className="p-5">
          {filteredCalendars.length === 0 ? (
            <View className="bg-white p-8 rounded-2xl shadow-lg items-center" style={{ backgroundColor: cardColor }}>
              <View className="bg-gray-100 rounded-full p-6 mb-4" style={{ backgroundColor: loadColor }}>
                <Ionicons
                  name="calendar-outline"
                  size={56}
                  color="#9ca3af"
                />
              </View>
              <Text className="text-lg font-bold text-gray-800 mb-2 text-center" style={{ color: textColor }}>
                No Calendars Found
              </Text>
              <Text className="text-gray-500 text-center mb-6" style={{ color: mutedColor }}>
                No academic calendars available for your year level at this time.
              </Text>
              <TouchableOpacity
                onPress={onRefresh}
                className="bg-[#af1616] px-6 py-3 rounded-xl flex-row items-center shadow-sm"
              >
                <Ionicons
                  name="refresh"
                  size={18}
                  color="white"
                />
                <Text className="text-white font-semibold ml-2">Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredCalendars.map((calendar) => (
              <View
                key={calendar.id}
                className="bg-white p-4 rounded-lg shadow mb-4"
                style={{ backgroundColor: cardColor }}
              >
                <Text className="text-lg font-bold text-[#af1616] mb-2" style={{ color: textColor }}>
                  {calendar.title}
                </Text>

                <Text className="text-sm text-gray-600 mb-2" style={{ color: textColor }}>
                  {formatDate(calendar.start_date)} -{" "}
                  {formatDate(calendar.end_date)}
                </Text>

                {calendar.description && (
                  <Text className="text-sm text-gray-700 mb-4">
                    {calendar.description}
                  </Text>
                )}

                {calendar.documents && calendar.documents.length > 0 && (
                  <View className="mt-3">
                    <Text className="text-sm font-medium text-gray-700 mb-2" style={{ color: textColor }}>
                      Attached Documents:
                    </Text>
                    {calendar.documents.map((document) => (
                      <View
                        key={document.id}
                        className="flex-row items-center justify-between bg-gray-50 p-3 rounded-lg mb-2 border border-gray-200"
                        style={{ backgroundColor: loadColor }}
                      >
                        <View className="flex-row items-center flex-1">
                          <View className="mr-3">
                            <FileIcon mimeType={document.mime_type} />
                          </View>

                          <View className="flex-1">
                            <Text
                              className="text-sm font-medium text-gray-800"
                              style={{color: textColor }}
                              numberOfLines={1}
                            >
                              {document.file_name}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              {formatFileSize(document.file_size)} •{" "}
                              {document.mime_type}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row space-x-2">
                          {document.mime_type.includes("pdf") && (
                            <TouchableOpacity
                              onPress={() =>
                                viewDocumentInBrowser(document, calendar.id)
                              }
                              className="p-2"
                            >
                              <Eye size={20} color="#af1616" />
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            onPress={() =>
                              downloadAndOpenFile(document, calendar.id)
                            }
                            disabled={downloading === document.id}
                            className="p-2"
                          >
                            {downloading === document.id ? (
                              <ActivityIndicator size="small" color="#af1616" />
                            ) : (
                              <Download size={20} color="#af1616" />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={viewerVisible}
        animationType="slide"
        onRequestClose={() => setViewerVisible(false)}
      >
        <View className="flex-1 bg-black">
          <View className="bg-[#af1616] pt-12 pb-4 px-5 flex-row items-center">
            <TouchableOpacity
              onPress={() => setViewerVisible(false)}
              className="mr-4"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text
              className="text-white text-lg font-bold flex-1"
              numberOfLines={1}
            >
              {selectedDocument?.file_name}
            </Text>
          </View>
          <View className="flex-1 justify-center items-center">
            {selectedDocument?.mime_type.includes("image") ? (
              <View className="flex-1 justify-center items-center">
                <ImageIcon size={64} color="#af1616" />
                <Text className="text-white mt-4 text-center">
                  Image preview not available. Download to view.
                </Text>
                <TouchableOpacity
                  className="bg-[#af1616] px-6 py-3 rounded-lg mt-4"
                  onPress={() => {
                    setViewerVisible(false);
                    if (selectedDocument) {
                      const calendar = filteredCalendars.find((cal) =>
                        cal.documents?.some(
                          (doc) => doc.id === selectedDocument.id
                        )
                      );
                      if (calendar) {
                        downloadAndOpenFile(selectedDocument, calendar.id);
                      }
                    }
                  }}
                >
                  <Text className="text-white">Download File</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-1 justify-center items-center">
                <FileIcon
                  mimeType={selectedDocument?.mime_type || ""}
                />
                <Text className="text-white mt-4 text-center">
                  Use the download button to view this file
                </Text>
                <TouchableOpacity
                  className="bg-[#af1616] px-6 py-3 rounded-lg mt-4"
                  onPress={() => {
                    setViewerVisible(false);
                    if (selectedDocument) {
                      const calendar = filteredCalendars.find((cal) =>
                        cal.documents?.some(
                          (doc) => doc.id === selectedDocument.id
                        )
                      );
                      if (calendar) {
                        downloadAndOpenFile(selectedDocument, calendar.id);
                      }
                    }
                  }}
                >
                  <Text className="text-white">Download File</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {!fileSystemAvailable && (
        <View className="bg-yellow-100 p-3 border-t border-yellow-400">
          <Text className="text-yellow-800 text-sm">
            File download functionality may be limited in this environment.
          </Text>
        </View>
      )}
    </View>
  );
};

export default SchoolCalendar;
