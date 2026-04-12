import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { API_BASE_URL } from '@/constants/Config';
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AcademicCalendar, AcademicCalendarDocument, SchoolCalendarResponse } from '@/@types/screens/school-calendar';


import { SkeletonLoader, ErrorState, MainEmptyState, FilteredEmptyState } from '@/components/school-calendar/SchoolCalendarStates';
import { CalendarCard } from '@/components/school-calendar/CalendarCard';
import { DocumentViewerModal } from '@/components/school-calendar/DocumentViewerModal';

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



  if (loading) {
    return <SkeletonLoader backgroundColor={backgroundColor} cardColor={cardColor} loadColor={loadColor} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => fetchCalendarData()} />;
  }

  if (!calendarData) {
    return (
      <MainEmptyState 
        backgroundColor={backgroundColor} 
        cardColor={cardColor} 
        textColor={textColor} 
        mutedColor={mutedColor} 
        loadColor={loadColor} 
        onRetry={() => fetchCalendarData()} 
        onBack={() => router.back()} 
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-50 pt-10" style={{ backgroundColor }}>
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200" style={{ backgroundColor: cardColor }}>
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color={textColor} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: textColor }}>School Calendar</Text>
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
            <FilteredEmptyState 
              cardColor={cardColor} 
              textColor={textColor} 
              mutedColor={mutedColor} 
              loadColor={loadColor} 
              onRefresh={onRefresh} 
            />
          ) : (
            filteredCalendars.map((calendar) => (
              <CalendarCard 
                key={calendar.id}
                calendar={calendar} 
                cardColor={cardColor} 
                loadColor={loadColor} 
                textColor={textColor} 
                downloading={downloading} 
                onViewDocument={viewDocumentInBrowser} 
                onDownloadDocument={downloadAndOpenFile} 
              />
            ))
          )}
        </View>
      </ScrollView>

      <DocumentViewerModal 
        visible={viewerVisible} 
        onClose={() => setViewerVisible(false)} 
        document={selectedDocument} 
        onDownload={() => {
          setViewerVisible(false);
          if (selectedDocument) {
            const calendar = filteredCalendars.find((cal) =>
              cal.documents?.some((doc) => doc.id === selectedDocument.id)
            );
            if (calendar) {
              downloadAndOpenFile(selectedDocument, calendar.id);
            }
          }
        }} 
      />

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
