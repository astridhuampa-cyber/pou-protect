export type SecurityStatus = 'secure' | 'precaution' | 'alert' | 'sos';

export type HouseMode = 'home' | 'sleeping' | 'away' | 'vacation';

export type QuickCategory = 'hogar' | 'calle' | 'vehiculo' | 'medica';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPriority: boolean;
  canViewLocation: boolean;
  receiveSOS: boolean;
  avatarColor: string;
}

export interface CameraFeed {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  hasMotion: boolean;
  lastMotionTimestamp: string;
  resolution: string;
  nightVision: boolean;
  isRecording: boolean;
  batteryPercent?: number;
  previewGradient: string;
}

export interface SafetyZone {
  id: string;
  name: string;
  type: 'safe' | 'precaution' | 'alert';
  description: string;
  verifiedSource: string;
  coordinates: { lat: number; lng: number };
  radiusMeters: number;
}

export interface AccessLog {
  id: string;
  doorName: string;
  personName: string;
  type: 'entry' | 'exit' | 'denied';
  timestamp: string;
  method: 'biometric' | 'pin' | 'nfc' | 'remote';
  avatarInitials: string;
}

export interface AuthorizedUser {
  id: string;
  name: string;
  role: 'Propietario' | 'Familiar' | 'Invitado' | 'Servicio';
  hasActiveKey: boolean;
  expiresText?: string;
  accessCount: number;
}

export interface DeliveryItem {
  id: string;
  provider: string;
  trackingNumber: string;
  courier: string;
  status: 'pending' | 'in_transit' | 'delivered';
  arrivalEstimated: string;
  instructions: string;
  isPendingVerification: boolean;
}

export interface PetProfile {
  id: string;
  name: string;
  type: 'Perro' | 'Gato' | 'Otro';
  breed: string;
  collarBattery: number;
  isInsideSafeZone: boolean;
  lastActivity: string;
  reminders: { id: string; title: string; date: string; completed: boolean }[];
}

export interface DeviceEnergy {
  id: string;
  name: string;
  category: 'Cámara' | 'Sensor' | 'Cerradura' | 'Alarma' | 'Collar' | 'Detector';
  batteryPercent: number;
  isCharging: boolean;
  isOnline: boolean;
  connectionType: 'Wi-Fi' | 'Zigbee' | 'Bluetooth';
  lastSeen: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  address: string;
  bloodType: string;
  allergies: string;
  medicalNotes: string;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  speechNarrationEnabled: boolean;
  speechSpeed: number;
  hapticFeedbackEnabled: boolean;
  visualFlashAlerts: boolean;
  simplifiedSeniorMode: boolean;
}

export interface SecurityEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'alert' | 'access' | 'camera' | 'delivery' | 'pet' | 'system';
  severity?: 'info' | 'warning' | 'critical';
  location?: string;
}


export interface AccessibilityConfig {
  highContrast: boolean;
  speechOutput: boolean;
  voiceCommands: boolean;
  largeFont: boolean;
  hapticFeedback: boolean;
  screenReaderDescriptions: boolean;
}

export interface SystemSettings {
  offlineMode: boolean;
  userName: string;
  userPhone: string;
  userBloodType: string;
  userAllergies: string;
  emergencyMessage: string;
  locationSharing: {
    isSharing: boolean;
    durationMinutes: number;
    startedAt?: string;
    expiresAt?: string;
    recipientsCount: number;
  };
  permissions: {
    location: boolean;
    microphone: boolean;
    notifications: boolean;
    camera: boolean;
    contacts: boolean;
  };
}
