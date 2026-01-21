import { CodeYellow } from "./CodeYellow";
import { AuthUser } from "./CurrentUser";
import { Group } from "./Group";

export enum WorkListType {
  GROUP = "group",
  PERSONAL = "personal",
}

export interface WorkList {
  id: string;
  type: WorkListType;
  usdPerRvu: number;
  userId?: string;
  user?: AuthUser;
  groupId?: string;
  group?: Group;
  codeYellows: CodeYellow[];
  updatedAt?: Date;
  createdAt?: Date;
}
