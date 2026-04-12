import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Eye, Download } from 'lucide-react-native';
import { AcademicCalendar, AcademicCalendarDocument } from '@/@types/screens/school-calendar';
import { formatDate, formatFileSize } from './utils';
import { FileIcon } from './FileIcon';

interface CalendarCardProps {
  calendar: AcademicCalendar;
  cardColor: string;
  loadColor: string;
  textColor: string;
  downloading: number | null;
  onViewDocument: (document: AcademicCalendarDocument, calendarId: number) => void;
  onDownloadDocument: (document: AcademicCalendarDocument, calendarId: number) => void;
}

export const CalendarCard = ({
  calendar,
  cardColor,
  loadColor,
  textColor,
  downloading,
  onViewDocument,
  onDownloadDocument,
}: CalendarCardProps) => {
  return (
    <View
      className="p-4 rounded-lg shadow mb-4"
      style={{ backgroundColor: cardColor }}
    >
      <Text className="text-lg font-bold mb-2" style={{ color: "#af1616" }}>
        {calendar.title}
      </Text>

      <Text className="text-sm mb-2" style={{ color: textColor }}>
        {formatDate(calendar.start_date)} - {formatDate(calendar.end_date)}
      </Text>

      {calendar.description && (
        <Text className="text-sm text-gray-700 mb-4" style={{ color: textColor }}>
          {calendar.description}
        </Text>
      )}

      {calendar.documents && calendar.documents.length > 0 && (
        <View className="mt-3">
          <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
            Attached Documents:
          </Text>
          {calendar.documents.map((document) => (
            <View
              key={document.id}
              className="flex-row items-center justify-between p-3 rounded-lg mb-2 border border-gray-200"
              style={{ backgroundColor: loadColor }}
            >
              <View className="flex-row items-center flex-1">
                <View className="mr-3">
                  <FileIcon mimeType={document.mime_type} />
                </View>

                <View className="flex-1">
                  <Text
                    className="text-sm font-medium"
                    style={{ color: textColor }}
                    numberOfLines={1}
                  >
                    {document.file_name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {formatFileSize(document.file_size)} • {document.mime_type}
                  </Text>
                </View>
              </View>

              <View className="flex-row space-x-2">
                {document.mime_type.includes("pdf") && (
                  <TouchableOpacity
                    onPress={() => onViewDocument(document, calendar.id)}
                    className="p-2"
                  >
                    <Eye size={20} color="#af1616" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => onDownloadDocument(document, calendar.id)}
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
  );
};
