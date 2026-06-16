import { useState } from 'react';
import {
  Camera,
  Clock,
  CheckCircle,
  XCircle,
  History,
  TrendingDown,
  Send,
  FileText,
  Phone,
  CheckSquare,
  Truck,
  User,
  MapPin,
  AlertTriangle,
  ChevronRight,
  X,
  ZoomIn,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { StatusBadge, PriorityBadge, PlateBadge, CallResultBadge } from '../StatusBadge';
import { Modal } from '../Modal';
import { formatDuration, formatDateTime, formatTime, cn, maskPhone } from '../../utils/helpers';
import type { CallResult } from '../../types';

const OFFICERS = ['张巡', '李检', '王刚', '赵军', '孙明'];

export function RecordsWindow() {
  const getSelectedRecord = useAppStore((state) => state.getSelectedRecord);
  const currentUser = useAppStore((state) => state.currentUser);
  const dispatchPatrol = useAppStore((state) => state.dispatchPatrol);
  const sendNotice = useAppStore((state) => state.sendNotice);
  const addCommunicationLog = useAppStore((state) => state.addCommunicationLog);
  const markAsMoved = useAppStore((state) => state.markAsMoved);
  const requestTow = useAppStore((state) => state.requestTow);
  const closeRecord = useAppStore((state) => state.closeRecord);
  const selectRecord = useAppStore((state) => state.selectRecord);
  const showCommunicationModal = useAppStore((state) => state.showCommunicationModal);
  const setShowCommunicationModal = useAppStore((state) => state.setShowCommunicationModal);

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showTowModal, setShowTowModal] = useState(false);
  const [towReason, setTowReason] = useState('');
  const [callResult, setCallResult] = useState<CallResult>('connected');
  const [callNotes, setCallNotes] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  const record = getSelectedRecord();

  if (!record) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>请在处置队列中选择一条记录</p>
          <p className="text-sm mt-1">查看车辆详细信息和现场记录</p>
        </div>
      </div>
    );
  }

  const handleDispatch = () => {
    if (selectedOfficer) {
      dispatchPatrol(record.id, selectedOfficer);
      setShowDispatchModal(false);
      setSelectedOfficer('');
    }
  };

  const handleSendNotice = () => {
    sendNotice(record.id, 'sms');
  };

  const handleAddCommunication = () => {
    if (currentUser) {
      addCommunicationLog(record.id, {
        callTime: new Date(),
        callResult,
        notes: callNotes,
        operatorId: currentUser.id,
        operatorName: currentUser.name,
      });
      setShowCommunicationModal(null);
      setCallResult('connected');
      setCallNotes('');
    }
  };

  const handleMarkMoved = () => {
    markAsMoved(record.id);
  };

  const handleRequestTow = () => {
    if (towReason.trim()) {
      requestTow(record.id, towReason);
      setShowTowModal(false);
      setTowReason('');
    }
  };

  const handleClose = () => {
    closeRecord(record.id);
    selectRecord(null);
  };

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="card p-3 bg-bg-primary">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <PlateBadge
                plateNumber={record.vehicle.plateNumber}
                plateType={record.vehicle.plateType}
              />
              <StatusBadge status={record.status} size="md" />
              <PriorityBadge priority={record.priority} size="md" />
            </div>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {record.vehicle.ownerName}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {maskPhone(record.vehicle.ownerPhone)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {record.areaName} · {record.spotNumber}
              </span>
            </div>
          </div>
          <button
            onClick={() => selectRecord(null)}
            className="p-1 hover:bg-bg-tertiary rounded transition-colors"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto space-y-4 pr-1">
        <div>
          <h4 className="text-text-primary text-sm font-medium mb-2 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-alert-orange" />
            巡更拍照 ({record.photos.length})
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {record.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square bg-bg-tertiary overflow-hidden cursor-pointer group border border-border-default hover:border-alert-orange/50 transition-colors"
                onClick={() => setSelectedPhoto(photo.photoUrl)}
              >
                <img
                  src={photo.photoUrl}
                  alt="巡更照片"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1.5 py-0.5">
                  <p className="text-[10px] text-white truncate">{photo.uploaderName}</p>
                  <p className="text-[10px] text-text-muted">{formatTime(photo.uploadTime)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-text-primary text-sm font-medium mb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-alert-blue" />
            进出场时间
          </h4>
          <div className="card p-3 bg-bg-primary">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-text-muted text-xs mb-1">入场时间</p>
                <p className="text-text-primary font-mono">{formatDateTime(record.entryTime)}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs mb-1">预计出场</p>
                <p className="text-alert-orange font-mono">
                  {formatDateTime(new Date(record.entryTime.getTime() + 240 * 60 * 1000))}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs mb-1">累计停留</p>
                <p className={cn(
                  'font-mono font-bold',
                  record.overtimeMinutes > 1440 ? 'text-alert-red' :
                  record.overtimeMinutes > 480 ? 'text-alert-orange' : 'text-text-primary'
                )}>
                  {formatDuration(record.overtimeMinutes)}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border-default">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">超时判定</span>
                <span className={cn(
                  'status-badge',
                  record.overtimeMinutes > 1440 ? 'bg-alert-red/20 text-alert-red border-alert-red/50' :
                  record.overtimeMinutes > 480 ? 'bg-alert-orange/20 text-alert-orange border-alert-orange/50' :
                  'bg-alert-yellow/20 text-alert-yellow border-alert-yellow/50'
                )}>
                  已超时 {formatDuration(record.overtimeMinutes)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-text-primary text-sm font-medium mb-2 flex items-center gap-1.5">
            {record.plateMatch ? (
              <CheckCircle className="w-4 h-4 text-alert-green" />
            ) : (
              <XCircle className="w-4 h-4 text-alert-red" />
            )}
            车牌比对
          </h4>
          <div className="card p-3 bg-bg-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-xs mb-1">识别结果</p>
                <PlateBadge
                  plateNumber={record.vehicle.plateNumber}
                  plateType={record.vehicle.plateType}
                />
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted" />
              <div>
                <p className="text-text-muted text-xs mb-1">登记信息</p>
                <PlateBadge
                  plateNumber={record.vehicle.plateNumber}
                  plateType={record.vehicle.plateType}
                />
              </div>
              <div className="flex items-center gap-2">
                {record.plateMatch ? (
                  <span className="status-badge bg-alert-green/20 text-alert-green border-alert-green/50">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    匹配一致
                  </span>
                ) : (
                  <span className="status-badge bg-alert-red/20 text-alert-red border-alert-red/50">
                    <XCircle className="w-3 h-3 mr-1" />
                    存在差异
                  </span>
                )}
              </div>
            </div>
            {record.plateMatchNote && (
              <p className="text-alert-orange text-xs mt-2">{record.plateMatchNote}</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-text-primary text-sm font-medium mb-2 flex items-center gap-1.5">
            <History className="w-4 h-4 text-alert-yellow" />
            历史占位记录
          </h4>
          <div className="border border-border-default overflow-hidden">
            <div className="table-header grid grid-cols-4 gap-2 px-3 py-2 text-xs">
              <span>时间</span>
              <span>位置</span>
              <span className="text-center">时长</span>
              <span className="text-center">状态</span>
            </div>
            <div className="max-h-32 overflow-auto">
              {record.historyRecords.slice(0, 5).map((hr) => (
                <div key={hr.id} className="table-row grid grid-cols-4 gap-2 px-3 py-2 text-xs">
                  <span className="text-text-secondary">{formatDateTime(hr.entryTime)}</span>
                  <span className="text-text-secondary">{hr.areaName} {hr.spotNumber}</span>
                  <span className={cn(
                    'text-center font-mono',
                    hr.isOvertime ? 'text-alert-orange' : 'text-text-primary'
                  )}>
                    {formatDuration(hr.durationMinutes)}
                  </span>
                  <span className="text-center">
                    {hr.isOvertime ? (
                      <span className="status-badge bg-alert-orange/20 text-alert-orange border-alert-orange/50">
                        超时
                      </span>
                    ) : (
                      <span className="status-badge bg-alert-green/20 text-alert-green border-alert-green/50">
                        正常
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-text-muted">
              累计超时 <span className="text-alert-orange font-medium">{record.vehicle.totalOvertimeCount}</span> 次
            </span>
            <span className="text-text-muted">
              累计时长 <span className="text-alert-orange font-medium">{formatDuration(record.vehicle.totalOvertimeMinutes)}</span>
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-text-primary text-sm font-medium mb-2 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-alert-red" />
            拥堵影响分析
          </h4>
          <div className="card p-3 bg-bg-primary">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-alert-red/20 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-alert-red" />
                </div>
                <div>
                  <p className="text-text-muted text-xs">周转率下降</p>
                  <p className="text-alert-red font-bold">{record.congestionImpact.turnoverRateReduction}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-alert-orange/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-alert-orange" />
                </div>
                <div>
                  <p className="text-text-muted text-xs">排队等待</p>
                  <p className="text-alert-orange font-bold">{record.congestionImpact.waitingCars} 辆</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-alert-yellow/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-alert-yellow" />
                </div>
                <div>
                  <p className="text-text-muted text-xs">影响车位</p>
                  <p className="text-alert-yellow font-bold">{record.congestionImpact.affectedSpots.length} 个</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-alert-blue/20 flex items-center justify-center">
                  <History className="w-5 h-5 text-alert-blue" />
                </div>
                <div>
                  <p className="text-text-muted text-xs">排队长度</p>
                  <p className="text-alert-blue font-bold">{record.congestionImpact.queueLength} 米</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {record.communicationLogs.length > 0 && (
          <div>
            <h4 className="text-text-primary text-sm font-medium mb-2 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-alert-blue" />
              沟通记录
            </h4>
            <div className="space-y-2">
              {record.communicationLogs.map((log) => (
                <div key={log.id} className="card p-3 bg-bg-primary">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CallResultBadge result={log.callResult} />
                      <span className="text-text-muted text-xs">{formatDateTime(log.callTime)}</span>
                    </div>
                    <span className="text-text-secondary text-xs">操作人：{log.operatorName}</span>
                  </div>
                  <p className="text-text-primary text-sm">{log.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border-default pt-3">
        <div className="flex flex-wrap gap-2">
          {record.status === 'pending' && (
            <>
              <button className="btn-secondary btn-sm flex items-center gap-1" onClick={() => setShowDispatchModal(true)}>
                <Send className="w-3.5 h-3.5" />
                分派巡逻
              </button>
              <button className="btn-primary btn-sm flex items-center gap-1" onClick={handleSendNotice}>
                <FileText className="w-3.5 h-3.5" />
                生成催挪单
              </button>
            </>
          )}
          {['dispatched', 'notice_sent', 'communicating'].includes(record.status) && (
            <>
              <button className="btn-secondary btn-sm flex items-center gap-1" onClick={() => setShowCommunicationModal(record.id)}>
                <Phone className="w-3.5 h-3.5" />
                记录电话沟通
              </button>
              <button className="btn-success btn-sm flex items-center gap-1" onClick={handleMarkMoved}>
                <CheckSquare className="w-3.5 h-3.5" />
                标注已挪车
              </button>
              <button className="btn-danger btn-sm flex items-center gap-1" onClick={() => setShowTowModal(true)}>
                <Truck className="w-3.5 h-3.5" />
                发起拖移
              </button>
            </>
          )}
          {record.status === 'moved' && (
            <button className="btn-success btn-sm flex items-center gap-1 w-full" onClick={handleClose}>
              <CheckCircle className="w-3.5 h-3.5" />
              确认闭环
            </button>
          )}
          {record.status === 'tow_executed' && (
            <button className="btn-success btn-sm flex items-center gap-1 w-full" onClick={handleClose}>
              <CheckCircle className="w-3.5 h-3.5" />
              确认闭环
            </button>
          )}
        </div>
      </div>

      <Modal isOpen={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} title="照片详情" size="lg">
        {selectedPhoto && (
          <div className="flex flex-col items-center">
            <img src={selectedPhoto} alt="巡更照片" className="max-w-full max-h-[60vh] object-contain" />
          </div>
        )}
      </Modal>

      <Modal isOpen={showDispatchModal} onClose={() => setShowDispatchModal(false)} title="分派巡逻" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-text-secondary text-sm mb-2 block">选择巡逻员</label>
            <select
              className="input-field"
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
            >
              <option value="">请选择巡逻员</option>
              {OFFICERS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setShowDispatchModal(false)}>取消</button>
            <button className="btn-primary" onClick={handleDispatch} disabled={!selectedOfficer}>确认派单</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!showCommunicationModal} onClose={() => setShowCommunicationModal(null)} title="记录电话沟通" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-text-secondary text-sm mb-2 block">沟通结果</label>
            <select
              className="input-field"
              value={callResult}
              onChange={(e) => setCallResult(e.target.value as CallResult)}
            >
              <option value="connected">已接通</option>
              <option value="no_answer">无人接听</option>
              <option value="refused">拒绝挪车</option>
              <option value="promised">承诺挪车</option>
            </select>
          </div>
          <div>
            <label className="text-text-secondary text-sm mb-2 block">沟通备注</label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="请记录沟通内容..."
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setShowCommunicationModal(null)}>取消</button>
            <button className="btn-primary" onClick={handleAddCommunication}>保存记录</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showTowModal} onClose={() => setShowTowModal(false)} title="发起拖移候选" size="sm">
        <div className="space-y-4">
          <div className="card p-3 bg-alert-red/10 border-alert-red/30">
            <p className="text-alert-red text-sm">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              拖移车辆需要班长审批，请确保已多次联系车主并留存证据
            </p>
          </div>
          <div>
            <label className="text-text-secondary text-sm mb-2 block">拖移原因</label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="请详细说明拖移原因..."
              value={towReason}
              onChange={(e) => setTowReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setShowTowModal(false)}>取消</button>
            <button className="btn-danger" onClick={handleRequestTow} disabled={!towReason.trim()}>
              提交拖移申请
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
