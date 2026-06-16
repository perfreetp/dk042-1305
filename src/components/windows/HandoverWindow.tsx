import { useState, useMemo } from 'react';
import {
  LogOut,
  Clock,
  CheckCircle,
  Car,
  Truck,
  Phone,
  AlertTriangle,
  FileText,
  User,
  ArrowRight,
  RefreshCw,
  BarChart3,
  Timer,
  MessageSquare,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { StatusBadge, PriorityBadge } from '../StatusBadge';
import { formatDateTime, formatDuration, cn } from '../../utils/helpers';
import { ConfirmDialog } from '../Modal';
import type { DispatchRecord } from '../../types';

export function HandoverWindow() {
  const currentUser = useAppStore((state) => state.currentUser);
  const currentShift = useAppStore((state) => state.currentShift);
  const dispatchRecords = useAppStore((state) => state.dispatchRecords);
  const handoverNotes = useAppStore((state) => state.handoverNotes);
  const setHandoverNotes = useAppStore((state) => state.setHandoverNotes);
  const completeHandover = useAppStore((state) => state.completeHandover);
  const calculatePerformance = useAppStore((state) => state.calculatePerformance);
  const getUnfinishedItems = useAppStore((state) => state.getUnfinishedItems);
  const selectRecord = useAppStore((state) => state.selectRecord);
  const setActiveWindow = useAppStore((state) => state.setActiveWindow);
  const addAlert = useAppStore((state) => state.addAlert);

  const [showConfirm, setShowConfirm] = useState(false);

  const unfinishedItems = useMemo(() => {
    return getUnfinishedItems();
  }, [getUnfinishedItems]);

  const performance = useMemo(() => {
    if (!currentShift) return null;
    return calculatePerformance();
  }, [currentShift, calculatePerformance]);

  const shiftStats = useMemo(() => {
    if (!currentShift) return null;
    const shiftRecords = dispatchRecords.filter((r) => r.shiftId === currentShift.id);
    const byStatus: Record<string, number> = {};
    shiftRecords.forEach((r) => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    });
    return {
      total: shiftRecords.length,
      byStatus,
    };
  }, [currentShift, dispatchRecords]);

  const handleRecordClick = (record: DispatchRecord) => {
    selectRecord(record.id);
    setActiveWindow('records');
  };

  const handleHandover = () => {
    const completed = completeHandover();
    setShowConfirm(false);
    if (completed) {
      addAlert({
        type: 'success',
        message: `交接班完成！本班次已闭环 ${completed.performanceSummary?.completedCount || 0} 项，未完成 ${completed.unfinishedItems.length} 项已移交下一班`,
      });
    }
  };

  const handleCancelHandover = () => {
    setShowConfirm(false);
  };

  const getGradeColor = (rate: number) => {
    if (rate >= 90) return 'text-alert-green';
    if (rate >= 75) return 'text-alert-blue';
    if (rate >= 60) return 'text-alert-orange';
    return 'text-alert-red';
  };

  const getGradeBg = (rate: number) => {
    if (rate >= 90) return 'bg-alert-green/10 border-alert-green/30';
    if (rate >= 75) return 'bg-alert-blue/10 border-alert-blue/30';
    if (rate >= 60) return 'bg-alert-orange/10 border-alert-orange/30';
    return 'bg-alert-red/10 border-alert-red/30';
  };

  const completionRate =
    performance && performance.totalDispatched > 0
      ? Math.round((performance.completedCount / performance.totalDispatched) * 100)
      : 0;

  return (
    <div className="h-full flex flex-col gap-4">
      {currentUser && currentShift && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-alert-orange/20 flex items-center justify-center">
                <User className="w-5 h-5 text-alert-orange" />
              </div>
              <div>
                <p className="text-text-primary font-semibold">{currentUser.name}</p>
                <p className="text-text-muted text-xs">工号: {currentUser.employeeNo}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-text-muted text-xs">班次ID</p>
              <p className="text-text-secondary text-xs font-mono">{currentShift.id.slice(0, 8)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-bg-tertiary/50 rounded-lg p-2">
              <div className="flex items-center gap-1 text-text-muted text-xs mb-1">
                <Clock className="w-3 h-3" />
                <span>接班时间</span>
              </div>
              <p className="text-text-primary font-medium">{formatDateTime(currentShift.startTime)}</p>
            </div>
            <div className="bg-bg-tertiary/50 rounded-lg p-2">
              <div className="flex items-center gap-1 text-text-muted text-xs mb-1">
                <Timer className="w-3 h-3" />
                <span>在岗时长</span>
              </div>
              <p className="text-text-primary font-medium">
                {formatDuration(Math.floor((Date.now() - new Date(currentShift.startTime).getTime()) / 60000))}
              </p>
            </div>
          </div>
        </div>
      )}

      {performance && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-alert-orange" />
            <h4 className="text-text-primary font-semibold text-sm">班次绩效</h4>
          </div>

          <div className={cn('rounded-lg p-3 border mb-3', getGradeBg(completionRate))}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-xs">闭环率</p>
                <p className={cn('text-2xl font-bold font-display', getGradeColor(completionRate))}>
                  {completionRate}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-text-muted text-xs">评级</p>
                <p className={cn('text-3xl font-bold font-display', getGradeColor(completionRate))}>
                  {completionRate >= 90 ? 'A' : completionRate >= 75 ? 'B' : completionRate >= 60 ? 'C' : 'D'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-bg-tertiary/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Car className="w-3 h-3 text-alert-orange" />
                <span className="text-text-muted text-xs">已派单</span>
              </div>
              <p className="text-text-primary font-bold text-lg">{performance.totalDispatched}</p>
            </div>
            <div className="bg-bg-tertiary/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="w-3 h-3 text-alert-green" />
                <span className="text-text-muted text-xs">已闭环</span>
              </div>
              <p className="text-alert-green font-bold text-lg">{performance.completedCount}</p>
            </div>
            <div className="bg-bg-tertiary/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Timer className="w-3 h-3 text-alert-blue" />
                <span className="text-text-muted text-xs">响应均时</span>
              </div>
              <p className="text-text-primary font-bold text-lg">{performance.averageResponseMinutes}分</p>
            </div>
            <div className="bg-bg-tertiary/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Phone className="w-3 h-3 text-alert-blue" />
                <span className="text-text-muted text-xs">联系成功率</span>
              </div>
              <p className="text-text-primary font-bold text-lg">{performance.contactSuccessRate}%</p>
            </div>
            <div className="bg-bg-tertiary/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="w-3 h-3 text-alert-green" />
                <span className="text-text-muted text-xs">已挪车</span>
              </div>
              <p className="text-alert-green font-bold text-lg">{performance.movedCount}</p>
            </div>
            <div className="bg-bg-tertiary/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Truck className="w-3 h-3 text-alert-red" />
                <span className="text-text-muted text-xs">拖移候选</span>
              </div>
              <p className="text-alert-red font-bold text-lg">{performance.towCandidateCount}</p>
            </div>
          </div>

          {shiftStats && (
            <div className="mt-3 pt-3 border-t border-border-default">
              <p className="text-text-muted text-xs mb-2">本班车次分布</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(shiftStats.byStatus).map(([status, count]) => (
                  <StatusBadge key={status} status={status as any} showCount={count} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card p-4 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-alert-yellow" />
            <h4 className="text-text-primary font-semibold text-sm">待交接事项</h4>
          </div>
          <span className="bg-alert-yellow/20 text-alert-yellow text-xs px-2 py-0.5 rounded-full">
            {unfinishedItems.length} 项
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {unfinishedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <CheckCircle className="w-10 h-10 text-alert-green/30 mb-2" />
              <p className="text-text-muted text-sm">所有事项已闭环</p>
              <p className="text-text-muted text-xs">可以顺利交接班</p>
            </div>
          ) : (
            unfinishedItems.slice(0, 8).map((record) => (
              <div
                key={record.id}
                className="bg-bg-tertiary/30 rounded-lg p-2 cursor-pointer hover:bg-bg-tertiary/60 transition-colors"
                onClick={() => handleRecordClick(record)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="plate-number">{record.vehicle.plateNumber}</span>
                    <PriorityBadge priority={record.priority} />
                  </div>
                  <StatusBadge status={record.status} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">
                    {record.areaName} · {record.spotNumber}
                  </span>
                  <span className="text-alert-orange">超时 {formatDuration(record.overtimeMinutes)}</span>
                </div>
              </div>
            ))
          )}
          {unfinishedItems.length > 8 && (
            <p className="text-text-muted text-xs text-center py-2">
              还有 {unfinishedItems.length - 8} 项未显示...
            </p>
          )}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-alert-orange" />
          <h4 className="text-text-primary font-semibold text-sm">交接备注</h4>
        </div>
        <textarea
          value={handoverNotes}
          onChange={(e) => setHandoverNotes(e.target.value)}
          placeholder="输入需要告知下一班次的注意事项、遗留问题、重点关注区域等..."
          className="input-field w-full h-20 resize-none text-sm"
        />
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span>完成交接班</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <ConfirmDialog
        open={showConfirm}
        title="确认交接班"
        message={
          <div className="space-y-3">
            <p className="text-text-primary">
              确定要完成当前班次的交接吗？交接后：
            </p>
            <ul className="text-text-muted text-sm space-y-1 list-disc list-inside">
              <li>当前班次的绩效将被锁定</li>
              <li>未完成事项将自动移交下一班</li>
              <li>交接备注将被永久记录</li>
            </ul>
            {unfinishedItems.length > 0 && (
              <div className="bg-alert-yellow/10 border border-alert-yellow/30 rounded-lg p-3">
                <p className="text-alert-yellow text-sm font-medium">
                  ⚠️ 还有 {unfinishedItems.length} 项未闭环
                </p>
              </div>
            )}
          </div>
        }
        confirmText="确认交接"
        cancelText="取消"
        variant="warning"
        onConfirm={handleHandover}
        onCancel={handleCancelHandover}
        onClose={handleCancelHandover}
      />
    </div>
  );
}
