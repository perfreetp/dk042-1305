import type {
  User,
  Vehicle,
  Area,
  ParkingSpot,
  ParkingRecord,
  DispatchRecord,
  PatrolPhoto,
  CommunicationLog,
  Shift,
  DispatchStatus,
  Priority,
  PlateType,
  VehicleType,
} from '../types';

const PROVINCES = ['京', '沪', '粤', '苏', '浙', '川', '鲁', '豫', '冀', '湘'];
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');
const COLORS = ['黑色', '白色', '银色', '灰色', '蓝色', '红色', '金色', '绿色'];
const NAMES = ['张伟', '李娜', '王强', '刘洋', '陈静', '杨帆', '赵敏', '黄磊', '周杰', '吴芳'];
const OFFICERS = ['张巡', '李检', '王刚', '赵军', '孙明'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPlate(): string {
  const province = randomItem(PROVINCES);
  const letter = randomItem(LETTERS);
  const digits = Array.from({ length: 5 }, () => randomInt(0, 9)).join('');
  return `${province}${letter}${digits}`;
}

function randomPhone(): string {
  return `1${randomInt(3, 9)}${Array.from({ length: 9 }, () => randomInt(0, 9)).join('')}`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function randomDateBeforeNow(hoursBefore: number, maxDaysBefore: number = 7): Date {
  const now = new Date();
  const hours = hoursBefore + randomInt(0, maxDaysBefore * 24);
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

export function generateUsers(): User[] {
  return [
    { id: generateId(), employeeNo: 'G001', name: '李明', role: 'guard' },
    { id: generateId(), employeeNo: 'G002', name: '王芳', role: 'guard' },
    { id: generateId(), employeeNo: 'L001', name: '张军', role: 'leader' },
    { id: generateId(), employeeNo: 'M001', name: '赵总', role: 'manager' },
  ];
}

export function generateVehicles(count: number): Vehicle[] {
  const vehicles: Vehicle[] = [];
  const plateTypes: PlateType[] = ['blue', 'green', 'yellow', 'white'];
  const vehicleTypes: VehicleType[] = ['sedan', 'suv', 'truck', 'van', 'motorcycle'];

  for (let i = 0; i < count; i++) {
    vehicles.push({
      id: generateId(),
      plateNumber: randomPlate(),
      plateType: randomItem(plateTypes),
      vehicleType: randomItem(vehicleTypes),
      color: randomItem(COLORS),
      ownerName: randomItem(NAMES),
      ownerPhone: randomPhone(),
      totalOvertimeCount: randomInt(0, 15),
      totalOvertimeMinutes: randomInt(0, 10080),
    });
  }
  return vehicles;
}

export function generateAreas(): Area[] {
  return [
    {
      id: 'area-a',
      name: 'A区 - 购物中心入口',
      totalSpots: 50,
      occupiedSpots: 42,
      overtimeSpots: 8,
      overtimeThreshold: 240,
      warningThreshold: 480,
      towThreshold: 1440,
      nightLock: true,
      nightLockStartTime: '22:00',
      nightLockEndTime: '06:00',
    },
    {
      id: 'area-b',
      name: 'B区 - 写字楼地下',
      totalSpots: 80,
      occupiedSpots: 65,
      overtimeSpots: 12,
      overtimeThreshold: 600,
      warningThreshold: 1440,
      towThreshold: 4320,
      nightLock: true,
      nightLockStartTime: '20:00',
      nightLockEndTime: '07:00',
    },
    {
      id: 'area-c',
      name: 'C区 - 园区地面',
      totalSpots: 100,
      occupiedSpots: 78,
      overtimeSpots: 5,
      overtimeThreshold: 240,
      warningThreshold: 480,
      towThreshold: 1440,
      nightLock: false,
      nightLockStartTime: '22:00',
      nightLockEndTime: '06:00',
    },
    {
      id: 'area-d',
      name: 'D区 - VIP专属',
      totalSpots: 30,
      occupiedSpots: 22,
      overtimeSpots: 3,
      overtimeThreshold: 480,
      warningThreshold: 1440,
      towThreshold: 2880,
      nightLock: false,
      nightLockStartTime: '22:00',
      nightLockEndTime: '06:00',
    },
    {
      id: 'area-e',
      name: 'E区 - 卸货区',
      totalSpots: 20,
      occupiedSpots: 15,
      overtimeSpots: 2,
      overtimeThreshold: 120,
      warningThreshold: 240,
      towThreshold: 480,
      nightLock: true,
      nightLockStartTime: '18:00',
      nightLockEndTime: '08:00',
    },
  ];
}

export function generateParkingSpots(areas: Area[]): ParkingSpot[] {
  const spots: ParkingSpot[] = [];
  const statuses = ['available', 'occupied', 'overtime', 'reserved'] as const;

  areas.forEach((area) => {
    const rows = Math.ceil(Math.sqrt(area.totalSpots));
    let spotIndex = 1;

    for (let row = 0; row < rows && spotIndex <= area.totalSpots; row++) {
      for (let col = 0; col < rows && spotIndex <= area.totalSpots; col++) {
        let status = statuses[randomInt(0, 3)];
        if (spotIndex > area.occupiedSpots + area.overtimeSpots) {
          status = 'available';
        } else if (spotIndex > area.occupiedSpots) {
          status = 'overtime';
        } else {
          status = Math.random() > 0.1 ? 'occupied' : 'reserved';
        }

        spots.push({
          id: `spot-${area.id}-${spotIndex}`,
          areaId: area.id,
          spotNumber: `${area.name.charAt(0)}${spotIndex.toString().padStart(3, '0')}`,
          status,
          row,
          col,
        });
        spotIndex++;
      }
    }
  });

  return spots;
}

export function generateDispatchRecords(
  vehicles: Vehicle[],
  areas: Area[],
  spots: ParkingSpot[],
  shiftId: string,
  currentUserId: string
): DispatchRecord[] {
  const records: DispatchRecord[] = [];
  const statuses: DispatchStatus[] = [
    'pending',
    'dispatched',
    'notice_sent',
    'communicating',
    'moved',
    'tow_candidate',
    'tow_approved',
    'tow_executed',
    'closed',
  ];
  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

  const overtimeSpots = spots.filter((s) => s.status === 'overtime');
  const recordCount = Math.min(25, overtimeSpots.length);

  for (let i = 0; i < recordCount; i++) {
    const vehicle = vehicles[i % vehicles.length];
    const area = areas[randomInt(0, areas.length - 1)];
    const spot = overtimeSpots[i % overtimeSpots.length];
    const overtimeHours = randomInt(4, 168);
    const overtimeMinutes = overtimeHours * 60;
    const entryTime = new Date(Date.now() - overtimeMinutes * 60 * 1000);
    const createTime = new Date(entryTime.getTime() + area.overtimeThreshold * 60 * 1000);

    const priority = overtimeHours < 8 ? 'low' : overtimeHours < 24 ? 'medium' : overtimeHours < 72 ? 'high' : 'urgent';
    let status: DispatchStatus = 'pending';
    if (overtimeHours > 120) status = 'tow_candidate';
    else if (overtimeHours > 72) status = 'communicating';
    else if (overtimeHours > 48) status = 'notice_sent';
    else if (overtimeHours > 24) status = 'dispatched';

    const photos: PatrolPhoto[] = [];
    const photoCount = randomInt(2, 5);
    for (let p = 0; p < photoCount; p++) {
      photos.push({
        id: generateId(),
        dispatchRecordId: '',
        photoUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`parking lot security camera photo of a ${vehicle.color} ${vehicle.vehicleType} in parking spot, surveillance style, night vision`)}&image_size=square`,
        uploadTime: new Date(createTime.getTime() + p * 30 * 60 * 1000),
        uploaderId: currentUserId,
        uploaderName: randomItem(OFFICERS),
        location: spot.spotNumber,
      });
    }

    const historyRecords: ParkingRecord[] = [];
    const historyCount = randomInt(3, 10);
    for (let h = 0; h < historyCount; h++) {
      const histDuration = randomInt(60, 1440);
      const histEntry = randomDateBeforeNow(histDuration, 30);
      historyRecords.push({
        id: generateId(),
        vehicleId: vehicle.id,
        spotId: spot.id,
        spotNumber: spot.spotNumber,
        areaName: area.name,
        entryTime: histEntry,
        exitTime: new Date(histEntry.getTime() + histDuration * 60 * 1000),
        durationMinutes: histDuration,
        isOvertime: histDuration > area.overtimeThreshold,
      });
    }

    const communicationLogs: CommunicationLog[] = [];
    if (['communicating', 'moved', 'tow_candidate', 'tow_approved', 'tow_executed', 'closed'].includes(status)) {
      const logCount = randomInt(1, 3);
      for (let c = 0; c < logCount; c++) {
        const results: CallResult[] = ['connected', 'no_answer', 'refused', 'promised'];
        communicationLogs.push({
          id: generateId(),
          dispatchRecordId: '',
          callTime: new Date(createTime.getTime() + (c + 1) * 60 * 60 * 1000),
          callResult: randomItem(results),
          notes: c === 0 ? '首次电话通知，车主表示尽快挪车' : '再次催促，车主态度不耐烦',
          operatorId: currentUserId,
          operatorName: randomItem(NAMES),
        });
      }
    }

    const record: DispatchRecord = {
      id: generateId(),
      vehicleId: vehicle.id,
      vehicle: { ...vehicle },
      spotId: spot.id,
      spotNumber: spot.spotNumber,
      areaId: area.id,
      areaName: area.name,
      shiftId,
      status,
      priority,
      createTime,
      dispatchTime: status !== 'pending' ? new Date(createTime.getTime() + 30 * 60 * 1000) : undefined,
      completeTime: ['moved', 'closed', 'tow_executed'].includes(status)
        ? new Date(createTime.getTime() + overtimeMinutes * 60 * 1000 * 0.8)
        : undefined,
      patrolOfficer: status !== 'pending' ? randomItem(OFFICERS) : undefined,
      noticeMethod: status !== 'pending' && status !== 'dispatched' ? 'phone' : undefined,
      towCandidateReason: status === 'tow_candidate' ? '多次联系拒不挪车，已占用车位超过5天' : undefined,
      entryTime,
      overtimeMinutes,
      plateMatch: Math.random() > 0.1,
      plateMatchNote: Math.random() > 0.9 ? '车牌识别与登记信息存在差异，需现场确认' : undefined,
      historyRecords,
      photos,
      communicationLogs,
      congestionImpact: {
        queueLength: randomInt(0, 10),
        waitingCars: randomInt(0, 5),
        affectedSpots: Array.from({ length: randomInt(1, 5) }, () => randomInt(1, 50)),
        turnoverRateReduction: randomInt(5, 40),
      },
    };

    record.photos = photos.map((p) => ({ ...p, dispatchRecordId: record.id }));
    record.communicationLogs = communicationLogs.map((c) => ({ ...c, dispatchRecordId: record.id }));

    records.push(record);
  }

  return records;
}

export function generateShift(userId: string, userName: string, isNew: boolean = true): Shift {
  const now = new Date();
  const shiftStart = new Date(now);
  shiftStart.setHours(now.getHours() - (now.getHours() % 8), 0, 0, 0);

  return {
    id: generateId(),
    userId,
    userName,
    startTime: isNew ? now : shiftStart,
    endTime: undefined,
    unfinishedItems: [],
  };
}

export function generateAllData() {
  const users = generateUsers();
  const defaultUser = users[0];
  const areas = generateAreas();
  const vehicles = generateVehicles(30);
  const parkingSpots = generateParkingSpots(areas);
  const shift = generateShift(defaultUser.id, defaultUser.name);
  const dispatchRecords = generateDispatchRecords(vehicles, areas, parkingSpots, shift.id, defaultUser.id);

  return {
    users,
    defaultUser,
    areas,
    vehicles,
    parkingSpots,
    shift,
    dispatchRecords,
  };
}
