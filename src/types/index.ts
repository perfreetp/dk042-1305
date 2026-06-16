export type UserRole = 'guard' | 'leader' | 'manager';

export interface User {
  id: string;
  employeeNo: string;
  name: string;
  role: UserRole;
}

export type DispatchStatus = 
  | 'pending' 
  | 'dispatched' 
  | 'notice_sent' 
  | 'communicating' 
  | 'moved' 
  | 'tow_candidate' 
  | 'tow_approved' 
  | 'tow_executed' 
  | 'closed';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type PlateType = 'blue' | 'green' | 'yellow' | 'white';

export type VehicleType = 'sedan' | 'suv' | 'truck' | 'van' | 'motorcycle';

export type SpotStatus = 'available' | 'occupied' | 'overtime' | 'reserved';

export type CallResult = 'connected' | 'no_answer' | 'refused' | 'promised';

export type NoticeMethod = 'sms' | 'phone' | 'app';

export interface Vehicle {
  id: string;
  plateNumber: string;
  plateType: PlateType;
  vehicleType: VehicleType;
  color: string;
  ownerName: string;
  ownerPhone: string;
  totalOvertimeCount: number;
  totalOvertimeMinutes: number;
}

export interface Area {
  id: string;
  name: string;
  totalSpots: number;
  occupiedSpots: number;
  overtimeSpots: number;
  overtimeThreshold: number;
  warningThreshold: number;
  towThreshold: number;
  nightLock: boolean;
  nightLockStartTime: string;
  nightLockEndTime: string;
}

export interface ParkingSpot {
  id: string;
  areaId: string;
  spotNumber: string;
  status: SpotStatus;
  currentVehicleId?: string;
  currentPlate?: string;
  row: number;
  col: number;
}

export interface ParkingRecord {
  id: string;
  vehicleId: string;
  spotId: string;
  spotNumber: string;
  areaName: string;
  entryTime: Date;
  exitTime?: Date;
  durationMinutes: number;
  isOvertime: boolean;
}

export interface CongestionImpact {
  queueLength: number;
  waitingCars: number;
  affectedSpots: number[];
  turnoverRateReduction: number;
}

export interface CommunicationLog {
  id: string;
  dispatchRecordId: string;
  callTime: Date;
  callResult: CallResult;
  notes: string;
  operatorId: string;
  operatorName: string;
}

export interface PatrolPhoto {
  id: string;
  dispatchRecordId: string;
  photoUrl: string;
  uploadTime: Date;
  uploaderId: string;
  uploaderName: string;
  location: string;
}

export interface DispatchRecord {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  spotId: string;
  spotNumber: string;
  areaId: string;
  areaName: string;
  shiftId: string;
  status: DispatchStatus;
  priority: Priority;
  createTime: Date;
  dispatchTime?: Date;
  completeTime?: Date;
  patrolOfficer?: string;
  noticeMethod?: NoticeMethod;
  towCandidateReason?: string;
  entryTime: Date;
  overtimeMinutes: number;
  plateMatch: boolean;
  plateMatchNote?: string;
  historyRecords: ParkingRecord[];
  photos: PatrolPhoto[];
  communicationLogs: CommunicationLog[];
  congestionImpact: CongestionImpact;
}

export interface PerformanceSummary {
  totalDispatched: number;
  completedCount: number;
  averageResponseMinutes: number;
  averageProcessMinutes: number;
  contactSuccessRate: number;
  movedCount: number;
  towCandidateCount: number;
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime?: Date;
  handoverNotes?: string;
  performanceSummary?: PerformanceSummary;
  unfinishedItems: string[];
  previousShiftId?: string;
  nextShiftId?: string;
}

export interface NoticeForm {
  id: string;
  dispatchRecordId: string;
  plateNumber: string;
  spotNumber: string;
  areaName: string;
  overtimeDuration: string;
  generateTime: Date;
  expiryTime: Date;
}

export interface WindowPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

export type WindowKey = 'overview' | 'dispatch' | 'records' | 'areas' | 'handover';

export interface AppState {
  currentUser: User | null;
  currentShift: Shift | null;
  dispatchRecords: DispatchRecord[];
  areas: Area[];
  parkingSpots: ParkingSpot[];
  selectedRecordId: string | null;
  filterAreaId: string | null;
  filterStatus: DispatchStatus | null;
  activeWindow: WindowKey | null;
  windowPositions: Record<WindowKey, WindowPosition>;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface FilterOptions {
  areaId?: string | null;
  status?: DispatchStatus | null;
  priority?: Priority | null;
  minOvertimeMinutes?: number;
  plateNumber?: string;
}

export const DISPATCH_STATUS_LABELS: Record<DispatchStatus, string> = {
  pending: '待处理',
  dispatched: '已派单',
  notice_sent: '已通知',
  communicating: '沟通中',
  moved: '已挪车',
  tow_candidate: '拖移候选',
  tow_approved: '拖移已批',
  tow_executed: '已拖移',
  closed: '已闭环',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

export const PLATE_TYPE_LABELS: Record<PlateType, string> = {
  blue: '蓝牌',
  green: '绿牌',
  yellow: '黄牌',
  white: '白牌',
};

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  sedan: '轿车',
  suv: 'SUV',
  truck: '货车',
  van: '面包车',
  motorcycle: '摩托车',
};

export const CALL_RESULT_LABELS: Record<CallResult, string> = {
  connected: '已接通',
  no_answer: '无人接听',
  refused: '拒绝挪车',
  promised: '承诺挪车',
};
