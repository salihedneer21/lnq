import { CurrentUser } from "./CurrentUser";
import { Group } from "./Group";
import { RepetitionSettings } from "./Repetition";
import { WorkList } from "./Worklist";

export enum DistributionType {
  OPEN = "open",
  TARGET = "target",
}

export interface RespondingProvider {
  id: string;
  timeOptIn: string;
  timeOptOut?: string;
  user: { id: string };
}

export interface CodeYellow {
  id: string;
  worklistId: string;
  worklist: WorkList;
  usdPerRvu: number;
  isActive: boolean;
  startTime: Date;
  endTime: Date | null;
  distributionType: DistributionType;
  respondingProviders: RespondingProvider[];
  group?: Group;
  activatingProvider?: CurrentUser;
  limits?: Limits;
  targetedProvidersCount?: number;
  targetedProviders?: string[];
  rvusTotal: number;
  amountTotal: number;
  amountLimit?: number;
  rvusLimit?: number;
  totalAmountPaid?: number;
  canManage?: boolean;
  userResponded?: boolean;
  studyCount?: number;
  isTargeted?: boolean;
  repeating?: boolean;
  repeat?: RepetitionSettings;
}

export enum LnqRepeatStatus {
  SCHEDULED = "Scheduled",
  STARTING_SOON = "Starting Soon",
  ACTIVE = "Active",
  DEACTIVATED = "Deactivated",
  ENDED = "Ended",
  ENDING_SOON = "Ending Soon",
}

export interface LnqRepeat {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date | null;
  distributionType: DistributionType;
  usdPerRvu: number;
  rvusLimit?: number;
  amountLimit?: number;
  worklist: WorkList | null;
  group: Group;
  activatingProvider?: CurrentUser;
  firstName?: string;
  lastName?: string;
  targetedProvidersCount?: number;
  groupProvidersCount?: number;
  canManage?: boolean;
  repeat: RepetitionSettings;
  activatingProviderName?: string;
  recurrence?: string;
  status: LnqRepeatStatus;
  endDate?: Date | null;
  targetedProviders?: CurrentUser[];
  repeatEnded?: boolean;
}

export interface Limits {
  amountLimit?: number;
  RVUsLimit?: number;
}
