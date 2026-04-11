import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Check, Eye, Download, Trash2, Info } from 'lucide-react-native';
import { Requirement, UploadedFile } from '@/@types/tabs';

interface RequirementItemProps {
  requirement: Requirement;
  textColor: string;
  cardColor: string;
  uploading: boolean;
  onViewFile: (file: UploadedFile, reqId: string) => void;
  onDownloadFile: (file: UploadedFile, reqId: string) => void;
  onDeleteFile: (reqId: string, fileId: string, fileName: string) => void;
  onBrowseFiles: (reqId: string) => void;
  onShowFeedback: (feedback: string) => void;
}

const FileIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "pdf":
      return <Image source={require("../../assets/images/pdf.png")} className="w-6 h-6" />;
    case "word":
    case "docs":
    case "docsx":
      return <Image source={require("../../assets/images/docs.png")} className="w-6 h-6" />;
    case "png":
      return <Image source={require("../../assets/images/png.png")} className="w-6 h-6" />;
    case "jpg":
      return <Image source={require("../../assets/images/jpg.png")} className="w-6 h-6" />;
    default:
      return <Image source={require("../../assets/images/jpg.png")} className="w-6 h-6" />;
  }
};

export const RequirementItem: React.FC<RequirementItemProps> = ({
  requirement: req,
  textColor,
  cardColor,
  uploading,
  onViewFile,
  onDownloadFile,
  onDeleteFile,
  onBrowseFiles,
  onShowFeedback,
}) => {
  return (
    <View
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
        {req.completed ? (
          <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
            <Check size={14} color="white" strokeWidth={3} />
          </View>
        ) : (
          <View className="w-6 h-6 border-2 border-gray-300 rounded-full" />
        )}
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
                            onShowFeedback(file.feedback);
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
              <View className="flex-row gap-1">
                <TouchableOpacity
                  className="bg-blue-50 border border-blue-200 p-2 rounded-full"
                  onPress={() => onViewFile(file, req.id)}
                  style={{ shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 }}
                >
                  <Eye size={14} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-green-50 border border-green-200 p-2 rounded-full"
                  onPress={() => onDownloadFile(file, req.id)}
                >
                  <Download size={14} color="#059669" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-red-50 border border-red-200 p-2 rounded-full"
                  onPress={() => onDeleteFile(req.id, file.id, file.name)}
                  style={{ shadowColor: '#ef4444', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 }}
                >
                  <Trash2 size={14} color="#dc2626" />
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
              onPress={() => onBrowseFiles(req.id)}
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
  );
};
