export type QRType =
  | "url"
  | "text"
  | "email"
  | "phone"
  | "sms"
  | "wifi"
  | "vcard"
  | "event"
  | "location"
  | "app"
  | "pdf"
  | "image"
  | "video"
  | "social";

export function validateUrl(value: string): string | null {
  try {
    new URL(value);
    return null;
  } catch {
    return "Invalid URL format.";
  }
}

export function validateEmail(value: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? null
    : "Invalid email address.";
}

export function validatePhone(value: string): string | null {
  return /^\+?[0-9\s\-()]{7,}$/.test(value)
    ? null
    : "Invalid phone number.";
}

export function validateSms(value: string): string | null {
  // Example: "+1234567890:Hello"
  const [phone, ...msg] = value.split(":");
  if (validatePhone(phone) !== null) return "Invalid phone number in SMS.";
  if (msg.join(":").length === 0) return "SMS message cannot be empty.";
  return null;
}

export function validateWifi(value: string): string | null {
  // Simple check: look for SSID and password
  if (!/S:.*;T:.*;P:.*;/.test(value)) {
    return "WiFi format should be: S:<SSID>;T:<WPA|WEP|nopass>;P:<password>;";
  }
  return null;
}

export function validateVCard(value: string): string | null {
  if (!value.includes("BEGIN:VCARD") || !value.includes("END:VCARD")) {
    return "vCard must start with BEGIN:VCARD and end with END:VCARD.";
  }
  return null;
}

export function validateEvent(value: string): string | null {
  if (!value.includes("BEGIN:VEVENT") || !value.includes("END:VEVENT")) {
    return "Event must start with BEGIN:VEVENT and end with END:VEVENT.";
  }
  return null;
}

export function validateLocation(value: string): string | null {
  // Example: "geo:latitude,longitude"
  return /^geo:-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(value)
    ? null
    : "Location must be in geo:latitude,longitude format.";
}

export function validateText(value: string): string | null {
  return value.trim().length > 0 ? null : "Text cannot be empty.";
}

export function validateApp(value: string): string | null {
  return value.trim().length > 0 ? null : "App link cannot be empty.";
}

export function validatePdf(value: string): string | null {
  if (!value.trim()) return "PDF file is required.";
  // Check if it's a data URL (file upload) or a regular URL
  if (value.startsWith('data:application/pdf')) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return validateUrl(value);
  }
  return "Please upload a PDF file or provide a valid PDF URL.";
}

export function validateImage(value: string): string | null {
  if (!value.trim()) return "Image file is required.";
  // Check if it's a data URL (file upload) or a regular URL
  if (value.startsWith('data:image/')) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return validateUrl(value);
  }
  return "Please upload an image file or provide a valid image URL.";
}

export function validateVideo(value: string): string | null {
  if (!value.trim()) return "Video file is required.";
  // Check if it's a data URL (file upload) or a regular URL
  if (value.startsWith('data:video/')) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return validateUrl(value);
  }
  return "Please upload a video file or provide a valid video URL.";
}

export function validateSocial(value: string): string | null {
  return validateUrl(value);
}

export function validateQR(type: QRType, value: string): string | null {
  switch (type) {
    case "url":
      return validateUrl(value);
    case "email":
      return validateEmail(value);
    case "phone":
      return validatePhone(value);
    case "sms":
      return validateSms(value);
    case "wifi":
      return validateWifi(value);
    case "vcard":
      return validateVCard(value);
    case "event":
      return validateEvent(value);
    case "location":
      return validateLocation(value);
    case "text":
      return validateText(value);
    case "app":
      return validateApp(value);
    case "pdf":
      return validatePdf(value);
    case "image":
      return validateImage(value);
    case "video":
      return validateVideo(value);
    case "social":
      return validateSocial(value);
    default:
      return null;
  }
} 