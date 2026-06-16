import { create } from 'zustand';
import type {
  User,
  Shift,
  DispatchRecord,
  Area,
  ParkingSpot,
  WindowKey,
  WindowPosition,
  Alert,
  DispatchStatus,
  FilterOptions,
  CommunicationLog,
  NoticeForm,
  PerformanceSummary,
} from '../types';
import { generateAllData } from '../utils/mockData';
import { generateId } from '../utils/helpers';

interface AppState {
  currentUser: User | null;
  currentShift: Shift | null;
  dispatchRecords: DispatchRecord[];
  areas: Area[];
  parkingSpots: ParkingSpot[];
  selectedRecordId: string | null;
  filterOptions: FilterOptions;
  activeWindow: WindowKey | null;
  windowPositions: Record<WindowKey, WindowPosition>;
  alerts: Alert[];
  selectedAreaId: string | null;
  handoverNotes: string;
  showNoticeForm: NoticeForm | null;
  showCommunicationModal: string | null;

  login: (employeeNo: string) => boolean;
  logout: () => void;
  initializeData: () => void;
  selectRecord: (id: string | null) => void;
  setFilterOptions: (options: Partial<FilterOptions>) => void;
  setActiveWindow: (key: WindowKey | null) => void;
  updateWindowPosition: (key: WindowKey, pos: Partial<WindowPosition>) => void;
  bringWindowToFront: (key: WindowKey) => void;
  minimizeWindow: (key: WindowKey) => void;
  maximizeWindow: (key: WindowKey) => void;
  closeWindow: (key: WindowKey) => void;
  restoreWindow: (key: WindowKey) => void;

  dispatchPatrol: (recordId: string, officer: string) => void;
  sendNotice: (recordId: string, method: 'sms' | 'phone' | 'app') => NoticeForm;
  addCommunicationLog: (recordId: string, log: Omit<CommunicationLog, 'id' | 'dispatchRecordId'>) => void;
  markAsMoved: (recordId: string) => void;
  requestTow: (recordId: string, reason: string) => void;
  approveTow: (recordId: string) => void;
  executeTow: (recordId: string) => void;
  closeRecord: (recordId: string) => void;

  batchDispatchPatrol: (recordIds: string[], officer: string) => void;
  batchSendNotice: (recordIds: string[]) => void;

  setSelectedAreaId: (id: string | null) => void;
  updateAreaThresholds: (areaId: string, thresholds: Partial<Area>) => void;
  toggleNightLock: (areaId: string) => void;

  setHandoverNotes: (notes: string) => void;
  completeHandover: () => Shift | null;
  calculatePerformance: () => PerformanceSummary;

  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  markAlertAsRead: (id: string) => void;
  clearAllAlerts: () => void;

  setShowNoticeForm: (form: NoticeForm | null) => void;
  setShowCommunicationModal: (recordId: string | null) => void;

  getFilteredRecords: () => DispatchRecord[];
  getSelectedRecord: () => DispatchRecord | undefined;
  getAreaStats: () => { id: string; name: string; overtimeCount: number }[];
  getUnfinishedItems: () => DispatchRecord[];
}

const defaultWindowPositions: Record<WindowKey, WindowPosition> = {
  overview: { x: 20, y: 20, width: 480, height: 380, zIndex: 1, isMinimized: false, isMaximized: false },
  dispatch: { x: 520, y: 20, width: 640, height: 520, zIndex: 2, isMinimized: false, isMaximized: false },
  records: { x: 20, y: 420, width: 480, height: 420, zIndex: 3, isMinimized: false, isMaximized: false },
  areas: { x: 520, y: 560, width: 640, height: 280, zIndex: 4, isMinimized: false, isMaximized: false },
  handover: { x: 1180, y: 20, width: 420, height: 820, zIndex: 5, isMinimized: false, isMaximized: false },
};

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  currentShift: null,
  dispatchRecords: [],
  areas: [],
  parkingSpots: [],
  selectedRecordId: null,
  filterOptions: {},
  activeWindow: null,
  windowPositions: defaultWindowPositions,
  alerts: [],
  selectedAreaId: null,
  handoverNotes: '',
  showNoticeForm: null,
  showCommunicationModal: null,

  login: (employeeNo: string) => {
    const data = generateAllData();
    const user = data.users.find((u) => u.employeeNo === employeeNo) || data.defaultUser;
    
    set({
      currentUser: user,
      currentShift: data.shift,
      dispatchRecords: data.dispatchRecords,
      areas: data.areas,
      parkingSpots: data.parkingSpots,
    });
    return true;
  },

  logout: () => {
    set({
      currentUser: null,
      currentShift: null,
      dispatchRecords: [],
      areas: [],
      parkingSpots: [],
      selectedRecordId: null,
    });
  },

  initializeData: () => {
    const data = generateAllData();
    set({
      dispatchRecords: data.dispatchRecords,
      areas: data.areas,
      parkingSpots: data.parkingSpots,
    });
  },

  selectRecord: (id) => set({ selectedRecordId: id }),

  setFilterOptions: (options) =>
    set((state) => ({ filterOptions: { ...state.filterOptions, ...options } })),

  setActiveWindow: (key) => set({ activeWindow: key }),

  updateWindowPosition: (key, pos) =>
    set((state) => ({
      windowPositions: {
        ...state.windowPositions,
        [key]: { ...state.windowPositions[key], ...pos },
      },
    })),

  bringWindowToFront: (key) =>
    set((state) => {
      const maxZ = Math.max(...Object.values(state.windowPositions).map((w) => w.zIndex));
      return {
        windowPositions: {
          ...state.windowPositions,
          [key]: { ...state.windowPositions[key], zIndex: maxZ + 1 },
        },
      };
    }),

  minimizeWindow: (key) =>
    set((state) => ({
      windowPositions: {
        ...state.windowPositions,
        [key]: { ...state.windowPositions[key], isMinimized: true },
      },
    })),

  maximizeWindow: (key) =>
    set((state) => ({
      windowPositions: {
        ...state.windowPositions,
        [key]: { ...state.windowPositions[key], isMaximized: !state.windowPositions[key].isMaximized },
      },
    })),

  closeWindow: (key) =>
    set((state) => ({
      windowPositions: {
        ...state.windowPositions,
        [key]: { ...state.windowPositions[key], isMinimized: true },
      },
    })),

  restoreWindow: (key) =>
    set((state) => ({
      windowPositions: {
        ...state.windowPositions,
        [key]: { ...state.windowPositions[key], isMinimized: false },
      },
    })),

  dispatchPatrol: (recordId, officer) =>
    set((state) => ({
      dispatchRecords: state.dispatchRecords.map((r) =>
        r.id === recordId
          ? { ...r, status: 'dispatched', patrolOfficer: officer, dispatchTime: new Date() }
          : r
      ),
    })),

  sendNotice: (recordId, method) => {
    const record = get().dispatchRecords.find((r) => r.id === recordId);
    if (!record) throw new Error('Record not found');

    const noticeForm: NoticeForm = {
      id: generateId(),
      dispatchRecordId: recordId,
      plateNumber: record.vehicle.plateNumber,
      spotNumber: record.spotNumber,
      areaName: record.areaName,
      overtimeDuration: `${Math.floor(record.overtimeMinutes / 60)}小时`,
      generateTime: new Date(),
      expiryTime: new Date(Date.now() + 30 * 60 * 1000),
    };

    set((state) => ({
      dispatchRecords: state.dispatchRecords.map((r) =>
        r.id === recordId
          ? { ...r, status: 'notice_sent', noticeMethod: method }
          : r
      ),
      showNoticeForm: noticeForm,
    }));

    return noticeForm;
  },

  addCommunicationLog: (recordId, log) =>
    set((state) => ({
      dispatchRecords: state.dispatchRecords.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: 'communicating',
              communicationLogs: [
                ...r.communicationLogs,
                { ...log, id: generateId(), dispatchRecordId: recordId },
              ],
            }
          : r
      ),
    })),

  markAsMoved: (recordId) =>
    set((state) => ({
      dispatchRecords: state.dispatchRecords.map((r) =>
        r.id === recordId
          ? { ...r, status: 'moved', completeTime: new Date() }
          : r
      ),
    })),

  requestTow: (recordId, reason) =>
    set((state) => ({
      dispatchRecords: state.dispatchRecords.map((r) =>
        r.id === recordId
          ? { ...r, status: 'tow_candidate', towCandidateReason: reason }
          : r
      ),
    })),

  approveTow: (recordId) =>
    set((state) => ({
      dispatchRecords: state.dispatchRecords.map((r) =>
        r.id === recordId ? { ...r, status: 'tow_approved' } : r
      ),
    })),

  executeTow: (recordId) =>
    set((state) => ({
      dispatchRecords: state.dispatchRecords.map((r) =>
        r.id === recordId
          ? { ...r, status: 'tow_executed', completeTime: new Date() }
          : r
      ),
    })),

  closeRecord: (recordId) =>
    set((state) => ({
      dispatchRecords: state.dispatchRecords.map((r) =>
        r.id === recordId ? { ...r, status: 'closed' } : r
      ),
    })),

  batchDispatchPatrol: (recordIds, officer) =>
    set((state) => ({
      dispatchRecords: state.dispatchRecords.map((r) =>
        recordIds.includes(r.id)
          ? { ...r, status: 'dispatched', patrolOfficer: officer, dispatchTime: new Date() }
          : r
      ),
    })),

  batchSendNotice: (recordIds) =>
    set((state) => ({
      dispatchRecords: state.dispatchRecords.map((r) =>
        recordIds.includes(r.id) ? { ...r, status: 'notice_sent', noticeMethod: 'sms' } : r
      ),
    })),

  setSelectedAreaId: (id) => set({ selectedAreaId: id }),

  updateAreaThresholds: (areaId, thresholds) =>
    set((state) => ({
      areas: state.areas.map((a) =>
        a.id === areaId ? { ...a, ...thresholds } : a
      ),
    })),

  toggleNightLock: (areaId) =>
    set((state) => ({
      areas: state.areas.map((a) =>
        a.id === areaId ? { ...a, nightLock: !a.nightLock } : a
      ),
    })),

  setHandoverNotes: (notes) => set({ handoverNotes: notes }),

  completeHandover: () => {
    const state = get();
    if (!state.currentShift || !state.currentUser) return null;

    const unfinished = state.dispatchRecords
      .filter((r) => !['moved', 'tow_executed', 'closed'].includes(r.status))
      .map((r) => r.id);

    const performance = state.calculatePerformance();

    const completedShift: Shift = {
      ...state.currentShift,
      endTime: new Date(),
      handoverNotes: state.handoverNotes,
      performanceSummary: performance,
      unfinishedItems: unfinished,
    };

    const newShift: Shift = {
      id: generateId(),
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      startTime: new Date(),
      unfinishedItems: unfinished,
      previousShiftId: completedShift.id,
    };

    set({
      currentShift: newShift,
      handoverNotes: '',
      dispatchRecords: state.dispatchRecords.map((r) => ({
        ...r,
        shiftId: newShift.id,
      })),
    });

    return completedShift;
  },

  calculatePerformance: () => {
    const state = get();
    const shiftRecords = state.dispatchRecords.filter(
      (r) => r.shiftId === state.currentShift?.id
    );

    const totalDispatched = shiftRecords.filter((r) => r.dispatchTime).length;
    const completedCount = shiftRecords.filter((r) =>
      ['moved', 'tow_executed', 'closed'].includes(r.status)
    ).length;
    const movedCount = shiftRecords.filter((r) => r.status === 'moved').length;
    const towCandidateCount = shiftRecords.filter((r) => r.status === 'tow_candidate').length;

    const withResponse = shiftRecords.filter(
      (r) => r.dispatchTime && r.createTime
    );
    const averageResponseMinutes =
      withResponse.length > 0
        ? withResponse.reduce(
            (sum, r) =>
              sum +
              (new Date(r.dispatchTime!).getTime() - new Date(r.createTime).getTime()) /
                60000,
            0
          ) / withResponse.length
        : 0;

    const withCompletion = shiftRecords.filter((r) => r.completeTime && r.dispatchTime);
    const averageProcessMinutes =
      withCompletion.length > 0
        ? withCompletion.reduce(
            (sum, r) =>
              sum +
              (new Date(r.completeTime!).getTime() - new Date(r.dispatchTime!).getTime()) /
                60000,
            0
          ) / withCompletion.length
        : 0;

    const withCommunication = shiftRecords.filter(
      (r) => r.communicationLogs.length > 0
    );
    const contactSuccessRate =
      withCommunication.length > 0
        ? (withCommunication.filter((r) =>
            r.communicationLogs.some((l) => l.callResult !== 'no_answer')
          ).length /
            withCommunication.length) *
          100
        : 0;

    return {
      totalDispatched,
      completedCount,
      averageResponseMinutes: Math.round(averageResponseMinutes),
      averageProcessMinutes: Math.round(averageProcessMinutes),
      contactSuccessRate: Math.round(contactSuccessRate),
      movedCount,
      towCandidateCount,
    };
  },

  addAlert: (alert) =>
    set((state) => ({
      alerts: [
        {
          ...alert,
          id: generateId(),
          timestamp: new Date(),
          read: false,
        },
        ...state.alerts,
      ],
    })),

  markAlertAsRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
    })),

  clearAllAlerts: () => set({ alerts: [] }),

  setShowNoticeForm: (form) => set({ showNoticeForm: form }),
  setShowCommunicationModal: (recordId) => set({ showCommunicationModal: recordId }),

  getFilteredRecords: () => {
    const state = get();
    let records = [...state.dispatchRecords];

    if (state.filterOptions.areaId) {
      records = records.filter((r) => r.areaId === state.filterOptions.areaId);
    }
    if (state.filterOptions.status) {
      records = records.filter((r) => r.status === state.filterOptions.status);
    }
    if (state.filterOptions.priority) {
      records = records.filter((r) => r.priority === state.filterOptions.priority);
    }
    if (state.filterOptions.minOvertimeMinutes) {
      records = records.filter((r) => r.overtimeMinutes >= state.filterOptions.minOvertimeMinutes!);
    }
    if (state.filterOptions.plateNumber) {
      const search = state.filterOptions.plateNumber.toLowerCase();
      records = records.filter((r) => r.vehicle.plateNumber.toLowerCase().includes(search));
    }

    return records.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  },

  getSelectedRecord: () => {
    const state = get();
    return state.dispatchRecords.find((r) => r.id === state.selectedRecordId);
  },

  getAreaStats: () => {
    const state = get();
    return state.areas.map((a) => ({
      id: a.id,
      name: a.name,
      overtimeCount: state.dispatchRecords.filter((r) => r.areaId === a.id).length,
    }));
  },

  getUnfinishedItems: () => {
    const state = get();
    return state.dispatchRecords.filter(
      (r) => !['moved', 'tow_executed', 'closed'].includes(r.status)
    );
  },
}));
