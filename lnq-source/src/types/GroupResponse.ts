import { GroupStatus } from "./Group";

export interface MyGroupResponse {
  id: string;
  facilityName: string;
  description: string;
  isActive: boolean;
  phone: string;
  groupStatus: GroupStatus;
  timeZone: string;
  payoutEnabled: boolean;
  preferredPaymentMethodId: string;
  lastSyncEndTime: Date;
  groupProvidersCount: number;
  paymentMethodAttached: boolean;
  isAdmin: boolean;
  worklistId: string;
}

export enum Status {
  PENDING = "pending",
  ACCEPTED = "accepted",
}

export interface AllGroupResponse {
  id: string;
  facilityName: string;
  description: string;
  isActive: boolean;
  phone: string;
  groupStatus: GroupStatus;
  payoutEnabled: boolean;
  groupProvidersCount: number;
  userStatusInGroup: Status;
  usdPerRvuHigh: number;
  usdPerRvuLow: number;
  usdPerRvuRecent: number;
  rvuRateVisible: boolean;
}
