import { useState, useMemo } from 'react';
import { Search, Filter, Send, FileText, CheckSquare, Square, ChevronDown, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { StatusBadge, PriorityBadge, PlateBadge } from '../StatusBadge';
import { Modal } from '../Modal';
import { formatDuration, formatDateTime, cn } from '../../utils/helpers';
import type { DispatchStatus, Priority, DispatchRecord } from '../../types';

const OFFICERS = ['张巡', '李检', '王刚', '赵军', '孙明'];

export function DispatchWindow() {
  const getFilteredRecords = useAppStore((state) => state.getFilteredRecords);
  const areas = useAppStore((state) => state.areas);
  const filterOptions = useAppStore((state) => state.filterOptions);
  const setFilterOptions = useAppStore((state) => state.setFilterOptions);
  const selectRecord = useAppStore((state) => state.selectRecord);
  const selectedRecordId = useAppStore((state) => state.selectedRecordId);
  const setActiveWindow = useAppStore((state) => state.setActiveWindow);
  const batchDispatchPatrol = useAppStore((state) => state.batchDispatchPatrol);
  const batchSendNotice = useAppStore((state) => state.batchSendNotice);
  const dispatchPatrol = useAppStore((state) => state.dispatchPatrol);
  const sendNotice = useAppStore((state) => state.sendNotice);
  const showNoticeForm = useAppStore((state) => state.showNoticeForm);
  const setShowNoticeForm = useAppStore((state) => state.setShowNoticeForm);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const records = useMemo(() => getFilteredRecords(), [getFilteredRecords]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map((r) => r.id)));
    }
  };

  const handleRowClick = (record: DispatchRecord) => {
    selectRecord(record.id);
    setActiveWindow('records');
  };

  const handleQuickDispatch = (recordId: string) => {
    dispatchPatrol(recordId, OFFICERS[0]);
  };

  const handleQuickNotice = (recordId: string) => {
    sendNotice(recordId, 'sms');
  };

  const handleBatchDispatch = () => {
    if (selectedIds.size > 0 && selectedOfficer) {
      batchDispatchPatrol(Array.from(selectedIds), selectedOfficer);
      setSelectedIds(new Set());
      setShowDispatchModal(false);
      setSelectedOfficer('');
    }
  };

  const handleBatchNotice = () => {
    if (selectedIds.size > 0) {
      batchSendNotice(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const statusOptions: { value: DispatchStatus | null; label: string }[] = [
    { value: null, label: '全部状态' },
    { value: 'pending', label: '待处理' },
    { value: 'dispatched', label: '已派单' },
    { value: 'notice_sent', label: '已通知' },
    { value: 'communicating', label: '沟通中' },
    { value: 'moved', label: '已挪车' },
    { value: 'tow_candidate', label: '拖移候选' },
    { value: 'closed', label: '已闭环' },
  ];

  const priorityOptions: { value: Priority | null; label: string }[] = [
    { value: null, label: '全部优先级' },
    { value: 'urgent', label: '紧急' },
    { value: 'high', label: '高' },
    { value: 'medium', label: '中' },
    { value: 'low', label: '低' },
  ];

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="搜索车牌号..."
            className="input-field pl-8 text-sm"
            value={filterOptions.plateNumber || ''}
            onChange={(e) => setFilterOptions({ plateNumber: e.target.value || undefined })}
          />
        </div>
        <button
          className={cn(
            'btn-secondary btn-sm flex items-center gap-1',
            showFilters && 'border-alert-orange text-alert-orange'
          )}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
          筛选
        </button>
      </div>

      {showFilters && (
        <div className="card p-3 grid grid-cols-3 gap-3 animate-fade-in">
          <div>
            <label className="text-text-muted text-xs mb-1 block">区域</label>
            <select
              className="input-field text-sm"
              value={filterOptions.areaId || ''}
              onChange={(e) => setFilterOptions({ areaId: e.target.value || null })}
            >
              <option value="">全部区域</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-text-muted text-xs mb-1 block">状态</label>
            <select
              className="input-field text-sm"
              value={filterOptions.status || ''}
              onChange={(e) => setFilterOptions({ status: (e.target.value as DispatchStatus) || null })}
            >
              {statusOptions.map((o) => (
                <option key={o.value || 'all'} value={o.value || ''}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-text-muted text-xs mb-1 block">优先级</label>
            <select
              className="input-field text-sm"
              value={filterOptions.priority || ''}
              onChange={(e) => setFilterOptions({ priority: (e.target.value as Priority) || null })}
            >
              {priorityOptions.map((o) => (
                <option key={o.value || 'all'} value={o.value || ''}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="card p-2 flex items-center justify-between bg-alert-orange/10 border-alert-orange/30">
          <span className="text-text-secondary text-sm">
            已选择 <span className="text-alert-orange font-semibold">{selectedIds.size}</span> 条记录
          </span>
          <div className="flex gap-2">
            <button className="btn-secondary btn-sm flex items-center gap-1" onClick={() => setShowDispatchModal(true)}>
              <Send className="w-3 h-3" />
              批量派单
            </button>
            <button className="btn-primary btn-sm flex items-center gap-1" onClick={handleBatchNotice}>
              <FileText className="w-3 h-3" />
              批量催挪
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col border border-border-default overflow-hidden">
        <div className="table-header grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-2 px-3 py-2 items-center">
          <button
            onClick={toggleSelectAll}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            {selectedIds.size === records.length && records.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-alert-orange" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
          <span>车辆信息</span>
          <span className="text-center">超时</span>
          <span className="text-center">优先级</span>
          <span className="text-center">状态</span>
          <span className="text-center">操作</span>
        </div>

        <div className="flex-1 overflow-auto">
          {records.length === 0 ? (
            <div className="h-full flex items-center justify-center text-text-muted">
              暂无符合条件的记录
            </div>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className={cn(
                  'table-row grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-2 px-3 py-2 items-center cursor-pointer',
                  selectedRecordId === record.id && 'bg-alert-orange/10 border-l-2 border-l-alert-orange'
                )}
                onClick={() => handleRowClick(record)}
              >
                <button
                  onClick={(e) => toggleSelect(record.id, e)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  {selectedIds.has(record.id) ? (
                    <CheckSquare className="w-4 h-4 text-alert-orange" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <PlateBadge
                      plateNumber={record.vehicle.plateNumber}
                      plateType={record.vehicle.plateType}
                    />
                    <span className="text-text-secondary text-xs">
                      {record.vehicle.color} {record.vehicle.vehicleType === 'sedan' ? '轿车' :
                       record.vehicle.vehicleType === 'suv' ? 'SUV' :
                       record.vehicle.vehicleType === 'truck' ? '货车' :
                       record.vehicle.vehicleType === 'van' ? '面包车' : '摩托车'}
                    </span>
                  </div>
                  <div className="text-text-muted text-xs mt-0.5 flex items-center gap-2">
                    <span>{record.areaName}</span>
                    <span>·</span>
                    <span>车位 {record.spotNumber}</span>
                    <span>·</span>
                    <span>车主: {record.vehicle.ownerName}</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className={cn(
                    'font-mono font-bold',
                    record.overtimeMinutes > 1440 ? 'text-alert-red' :
                    record.overtimeMinutes > 480 ? 'text-alert-orange' : 'text-text-primary'
                  )}>
                    {formatDuration(record.overtimeMinutes)}
                  </span>
                </div>
                <div className="text-center">
                  <PriorityBadge priority={record.priority} />
                </div>
                <div className="text-center">
                  <StatusBadge status={record.status} />
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {record.status === 'pending' && (
                    <>
                      <button
                        className="p-1.5 hover:bg-bg-tertiary rounded text-alert-blue hover:text-alert-blue transition-colors"
                        title="快速派单"
                        onClick={() => handleQuickDispatch(record.id)}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-bg-tertiary rounded text-alert-orange hover:text-alert-orange transition-colors"
                        title="发送催挪单"
                        onClick={() => handleQuickNotice(record.id)}
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    className="p-1.5 hover:bg-bg-tertiary rounded text-text-muted hover:text-text-primary transition-colors"
                    title="查看详情"
                    onClick={() => handleRowClick(record)}
                  >
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
        title="批量分派巡逻"
        size="sm"
      >
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
            <button className="btn-secondary" onClick={() => setShowDispatchModal(false)}>
              取消
            </button>
            <button
              className="btn-primary"
              onClick={handleBatchDispatch}
              disabled={!selectedOfficer}
            >
              确认派单
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!showNoticeForm}
        onClose={() => setShowNoticeForm(null)}
        title="催挪单已生成"
        size="sm"
      >
        {showNoticeForm && (
          <div className="space-y-4">
            <div className="card p-4 bg-bg-primary border-dashed">
              <div className="text-center mb-4">
                <div className="text-alert-orange text-2xl font-bold mb-2">催挪通知单</div>
                <div className="text-text-muted text-xs">NO. {showNoticeForm.id.toUpperCase()}</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">车牌号</span>
                  <span className="font-mono font-bold">{showNoticeForm.plateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">停放位置</span>
                  <span>{showNoticeForm.areaName} {showNoticeForm.spotNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">超时时长</span>
                  <span className="text-alert-orange font-medium">{showNoticeForm.overtimeDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">生成时间</span>
                  <span>{formatDateTime(showNoticeForm.generateTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">有效期至</span>
                  <span className="text-alert-red">{formatDateTime(showNoticeForm.expiryTime)}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border-default text-center text-text-muted text-xs">
                请在 {Math.round((showNoticeForm.expiryTime.getTime() - showNoticeForm.generateTime.getTime()) / 60000)} 分钟内挪车，否则将采取进一步措施
              </div>
            </div>
            <p className="text-text-secondary text-sm text-center">
              已通过短信通知车主 {showNoticeForm.plateNumber}
            </p>
            <button className="btn-primary w-full" onClick={() => setShowNoticeForm(null)}>
              确认
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
