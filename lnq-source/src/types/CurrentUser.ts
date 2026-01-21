export enum UserRoleType {
  ADMIN = "admin",
  PROVIDER = "provider",
}

export enum AccountStatus {
  NEEDS_VERIFICATION = "needs_verification",
  VERIFIED = "verified",
  NEEDS_PASSWORD_RESET = "needs_password_reset",
  NEEDS_PASSWORD_UPDATE = "needs_password_update",
  TEMPORARY_PASSWORD = "temp_password",
  PENDING_FIRST_LOGIN = "pending_first_login",
}

export interface UserInterest {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialty?: string;
  additionalInfo?: string;
  availabilityPreferenceDays?: string[];
  availabilityPreferenceHours?: string[];
  weekdays?: boolean;
  weekends?: boolean;
  swingShifts?: boolean;
  overnights?: boolean;
  dedicatedShifts?: boolean;
  rvuPerMonth?: string;
  stateLicenses?: string[];
  agreeToTerms?: boolean;
  hasMalpracticeInsurance?: boolean;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CurrentUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  role?: UserRoleType;
  providerId?: string;
  updatedAt?: Date;
  createdAt?: Date;
  mfaEnabled?: boolean;
  isAvailable?: boolean;
  accountStatus?: AccountStatus;
  stripeAccountId?: string;
  cometChatId?: string;
  smsNotifications?: boolean;
  userInterest?: UserInterest;
}

export interface AuthUser {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  role?: UserRoleType;
  providerId?: string;
  updatedAt?: Date;
  createdAt?: Date;
  mfaEnabled?: boolean;
  isAvailable?: boolean;
  password?: string;
  accountStatus?: AccountStatus;
  accessToken?: string;
  specialty?: string;
  additionalInfo?: string;
  availabilityPreferences?: {
    days: string[];
    hours: string[];
  };
  workTypes?: {
    weekdays: boolean;
    weekends: boolean;
    swingShifts: boolean;
    overnights: boolean;
    dedicatedShifts: boolean;
  };
  rvuPerMonth?: string;
  stateLicenses?: string[];
  hasMalpracticeInsurance?: boolean | null;
}

export interface ProviderProfile extends CurrentUser {
  subSpecialties?: string[];
  providerNotes?: string;
  workDays?: string[];
  workHours?: string[];
  workType?: {
    weekdays: boolean;
    weekends: boolean;
    swing: boolean;
    overnights: boolean;
    dedicated: boolean;
  };
  rvus?: string[];
  stateLicenses?: string[];
  credentialPacket?: string;
  malpractice?: boolean;
}
