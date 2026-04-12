import React from 'react';
import { Image } from 'react-native';

export const FileIcon = ({ mimeType }: { mimeType: string }) => {
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
