## 1. 架构设计

本项目采用纯前端 + Mock 数据的架构，所有数据存储在浏览器本地（localStorage/indexedDB），模拟真实后端接口。前端采用 React + TypeScript + Vite 技术栈，状态管理使用 Zustand，UI 样式使用 TailwindCSS。

```mermaid
graph TD
    A["桌面端浏览器"] --> B["React SPA (Vite)"]
    B --> C["状态管理层 (Zustand)"]
    C --> D["业务逻辑层 (Hooks)"]
    D --> E["数据访问层 (API Service)"]
    E --> F["本地存储 (IndexedDB)"]
    E --> G["Mock 数据生成器"]
    B --> H["UI 组件层"]
    H --> I["可拖拽窗口容器"]
    H --> J["业务组件 (5个主窗口)"]
    H --> K["通用组件 (表格/表单/图表)"]
```

## 2. 技术描述

- **前端框架**: React@18 + TypeScript
- **构建工具**: Vite@5
- **状态管理**: Zustand@4
- **路由**: React Router DOM@6
- **样式**: TailwindCSS@3 + CSS 变量
- **图标**: Lucide React
- **图表**: Recharts（轻量级图表库）
- **拖拽**: 自定义实现（基于 React Draggable 思路）
- **本地存储**: IndexedDB（使用 idb 库封装）
- **后端**: 无后端，纯前端 Mock 数据
- **数据持久化**: 浏览器 IndexedDB + localStorage

## 3. 路由定义

| 路由 | 用途 |
|-------|---------|
| `/` | 主看板页面，包含 5 个可拖拽窗口 |
| `/login` | 登录页面 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    USER ||--o{ SHIFT : "负责"
    SHIFT ||--o{ DISPATCH_RECORD : "处理"
    VEHICLE ||--o{ PARKING_RECORD : "产生"
    VEHICLE ||--o{ DISPATCH_RECORD : "被处置"
    AREA ||--o{ PARKING_SPOT : "包含"
    PARKING_SPOT ||--o{ PARKING_RECORD : "产生"
    DISPATCH_RECORD ||--o{ COMMUNICATION_LOG : "记录"
    DISPATCH_RECORD ||--o{ PATROL_PHOTO : "包含"

    USER {
        string id PK
        string employeeNo
        string name
        string role
        string passwordHash
    }

    SHIFT {
        string id PK
        string userId FK
        datetime startTime
        datetime endTime
        string handoverNotes
        string performanceSummary
    }

    VEHICLE {
        string id PK
        string plateNumber
        string plateType
        string vehicleType
        string color
        string ownerName
        string ownerPhone
        int totalOvertimeCount
        int totalOvertimeMinutes
    }

    AREA {
        string id PK
        string name
        int totalSpots
        int overtimeThreshold
        int warningThreshold
        int towThreshold
        boolean nightLock
        string nightLockStartTime
        string nightLockEndTime
    }

    PARKING_SPOT {
        string id PK
        string areaId FK
        string spotNumber
        string status
        string currentVehicleId FK
    }

    PARKING_RECORD {
        string id PK
        string vehicleId FK
        string spotId FK
        datetime entryTime
        datetime exitTime
        int durationMinutes
        boolean isOvertime
    }

    DISPATCH_RECORD {
        string id PK
        string vehicleId FK
        string spotId FK
        string shiftId FK
        string status
        int priority
        datetime createTime
        datetime dispatchTime
        datetime completeTime
        string patrolOfficer
        string noticeMethod
        string towCandidateReason
    }

    COMMUNICATION_LOG {
        string id PK
        string dispatchRecordId FK
        datetime callTime
        string callResult
        string notes
        string operatorId FK
    }

    PATROL_PHOTO {
        string id PK
        string dispatchRecordId FK
        string photoUrl
        datetime uploadTime
        string uploaderId FK
        string location
    }
```

### 4.2 TypeScript 类型定义

```typescript
// 用户类型
interface User {
  id: string;
  employeeNo: string;
  name: string;
  role: 'guard' | 'leader' | 'manager';
}

// 班次类型
interface Shift {
  id: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime?: Date;
  handoverNotes?: string;
  performanceSummary?: PerformanceSummary;
  unfinishedItems: string[];
}

// 车辆类型
interface Vehicle {
  id: string;
  plateNumber: string;
  plateType: 'blue' | 'green' | 'yellow' | 'white';
  vehicleType: 'sedan' | 'suv' | 'truck' | 'van' | 'motorcycle';
  color: string;
  ownerName: string;
  ownerPhone: string;
  totalOvertimeCount: number;
  totalOvertimeMinutes: number;
}

// 区域类型
interface Area {
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

// 车位类型
interface ParkingSpot {
  id: string;
  areaId: string;
  spotNumber: string;
  status: 'available' | 'occupied' | 'overtime' | 'reserved';
  currentVehicleId?: string;
  currentPlate?: string;
}

// 停车记录
interface ParkingRecord {
  id: string;
  vehicleId: string;
  spotId: string;
  entryTime: Date;
  exitTime?: Date;
  durationMinutes: number;
  isOvertime: boolean;
}

// 处置记录
interface DispatchRecord {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  spotId: string;
  spotNumber: string;
  areaId: string;
  areaName: string;
  shiftId: string;
  status: DispatchStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createTime: Date;
  dispatchTime?: Date;
  completeTime?: Date;
  patrolOfficer?: string;
  noticeMethod?: 'sms' | 'phone' | 'app';
  towCandidateReason?: string;
  historyRecords: ParkingRecord[];
  photos: PatrolPhoto[];
  communicationLogs: CommunicationLog[];
  congestionImpact: CongestionImpact;
}

// 处置状态
type DispatchStatus = 
  | 'pending' 
  | 'dispatched' 
  | 'notice_sent' 
  | 'communicating' 
  | 'moved' 
  | 'tow_candidate' 
  | 'tow_approved' 
  | 'tow_executed' 
  | 'closed';

// 沟通记录
interface CommunicationLog {
  id: string;
  dispatchRecordId: string;
  callTime: Date;
  callResult: 'connected' | 'no_answer' | 'refused' | 'promised';
  notes: string;
  operatorId: string;
  operatorName: string;
}

// 巡更照片
interface PatrolPhoto {
  id: string;
  dispatchRecordId: string;
  photoUrl: string;
  uploadTime: Date;
  uploaderId: string;
  uploaderName: string;
  location: string;
}

// 拥堵影响
interface CongestionImpact {
  queueLength: number;
  waitingCars: number;
  affectedSpots: number[];
  turnoverRateReduction: number;
}

// 绩效汇总
interface PerformanceSummary {
  totalDispatched: number;
  completedCount: number;
  averageResponseMinutes: number;
  averageProcessMinutes: number;
  contactSuccessRate: number;
  movedCount: number;
  towCandidateCount: number;
}

// 催挪单
interface NoticeForm {
  id: string;
  dispatchRecordId: string;
  plateNumber: string;
  spotNumber: string;
  areaName: string;
  overtimeDuration: string;
  generateTime: Date;
  expiryTime: Date;
}
```

### 4.3 Mock 数据说明

- 使用 Faker.js 生成模拟数据
- 预置 5 个区域（A/B/C/D/E 区）
- 预置 3-5 名巡逻员
- 预置 20-30 辆超时车辆，超时时长从 4 小时到 7 天不等
- 预置历史占位记录，每辆车 3-10 条历史记录
- 预置巡更照片（使用占位图片服务）
- 数据初始化在应用启动时完成，存储在 IndexedDB
