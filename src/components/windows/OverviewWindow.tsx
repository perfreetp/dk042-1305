import { AlertTriangle, CheckCircle, Car, Truck, Clock, Bell, MapPin } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { StatCard } from '../StatCard';
import { ProgressRing } from '../ProgressRing';
import { formatDateTime, formatDuration, cn } from '../../utils/helpers';
import { useMemo, useEffect, useState } from 'react';

export function OverviewWindow() {
  const dispatchRecords = useAppStore((state) => state.dispatchRecords);
  const areas = useAppStore((state) => state.areas);
  const alerts = useAppStore((state) => state.alerts);
  const currentShift = useAppStore((state) => state.currentShift);
  const calculatePerformance = useAppStore((state) => state.calculatePerformance);
  const setFilterOptions = useAppStore((state) => state.setFilterOptions);
  const selectRecord = useAppStore((state) => state.selectRecord);
  const setActiveWindow = useAppStore((state) => state.setActiveWindow);
  const markAlertAsRead = useAppStore((state) => state.markAlertAsRead);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const pending = dispatchRecords.filter((r) => r.status === 'pending').length;
    const dispatched = dispatchRecords.filter(
      (r) => ['dispatched', 'notice_sent', 'communicating'].includes(r.status)
    ).length;
    const moved = dispatchRecords.filter((r) => r.status === 'moved').length;
    const tow = dispatchRecords.filter(
      (r) => ['tow_candidate', 'tow_approved', 'tow_executed'].includes(r.status)
    ).length;
    const urgent = dispatchRecords.filter((r) => r.priority === 'urgent').length;
    const avgOvertime =
      dispatchRecords.length > 0
        ? Math.round(dispatchRecords.reduce((sum, r) => sum + r.overtimeMinutes, 0) / dispatchRecords.length)
        : 0;

    return { pending, dispatched, moved, tow, urgent, avgOvertime, total: dispatchRecords.length };
  }, [dispatchRecords]);

  const performance = useMemo(() => {
    if (!currentShift) return null;
    return calculatePerformance();
  }, [currentShift, calculatePerformance]);

  const areaStats = useMemo(() => {
    return areas.map((area) => ({
      ...area,
      overtimeCount: dispatchRecords.filter((r) => r.areaId === area.id).length,
    }));
  }, [areas, dispatchRecords]);

  const unreadAlerts = alerts.filter((a) => !a.read).slice(0, 5);

  const handleAreaClick = (areaId: string) => {
    setFilterOptions({ areaId });
    setActiveWindow('dispatch');
  };

  const handleUrgentClick = () => {
    const urgentRecord = dispatchRecords.find((r) => r.priority === 'urgent');
    if (urgentRecord) {
      selectRecord(urgentRecord.id);
      setActiveWindow('records');
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-muted text-xs">当前时间</p>
          <p className="data-display text-xl text-text-primary">{formatDateTime(currentTime)}</p>
        </div>
        {currentShift && (
          <div className="text-right">
            <p className="text-text-muted text-xs">本班开始</p>
            <p className="text-text-secondary text-sm">{formatDateTime(currentShift.startTime)}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="待处置"
          value={stats.pending}
          icon={<Clock className="w-5 h-5" />}
          color="yellow"
          subtitle="等待派单"
          onClick={() => setFilterOptions({ status: 'pending' })}
        />
        <StatCard
          title="处理中"
          value={stats.dispatched}
          icon={<Car className="w-5 h-5" />}
          color="orange"
          subtitle="正在处置"
          onClick={() => setFilterOptions({ status: 'dispatched' })}
        />
        <StatCard
          title="已挪车"
          value={stats.moved}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
          subtitle="处置完成"
        />
        <StatCard
          title="拖移候选"
          value={stats.tow}
          icon={<Truck className="w-5 h-5" />}
          color="red"
          subtitle="等待审批"
          onClick={() => setFilterOptions({ status: 'tow_candidate' })}
        />
      </div>

      {stats.urgent > 0 && (
        <div
          className="card p-3 border-alert-red/50 bg-alert-red/10 cursor-pointer animate-glow-pulse hover:shadow-glow-red transition-all"
          onClick={handleUrgentClick}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-alert-red animate-pulse" />
            <div>
              <p className="text-alert-red font-semibold">
                有 {stats.urgent} 辆紧急超时车辆需要立即处理！
              </p>
              <p className="text-text-secondary text-xs">
                点击查看详情，平均超时时长：{formatDuration(stats.avgOvertime)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {performance && (
            <ProgressRing
              value={performance.completedCount}
              max={performance.totalDispatched || 1}
              size={100}
              label="处置完成率"
              color="green"
            />
          )}
        </div>
        <div className="flex-1 space-y-1">
          {performance && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">平均响应</span>
                <span className="text-text-primary font-medium">{performance.averageResponseMinutes}分钟</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">平均处置</span>
                <span className="text-text-primary font-medium">{performance.averageProcessMinutes}分钟</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">联系成功率</span>
                <span className="text-alert-green font-medium">{performance.contactSuccessRate}%</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <p className="text-text-secondary text-xs font-medium mb-2 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          区域超时分布
        </p>
        <div className="space-y-2">
          {areaStats.map((area) => (
            <div
              key={area.id}
              className="card p-2 cursor-pointer hover:border-alert-orange/50 transition-all"
              onClick={() => handleAreaClick(area.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-text-primary text-sm font-medium">{area.name}</span>
                <span className={cn(
                  'data-display text-lg',
                  area.overtimeCount > 5 ? 'text-alert-red' : area.overtimeCount > 2 ? 'text-alert-orange' : 'text-text-secondary'
                )}>
                  {area.overtimeCount}
                </span>
              </div>
              <div className="h-1.5 bg-bg-tertiary overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-500',
                    area.overtimeCount > 5 ? 'bg-alert-red' : area.overtimeCount > 2 ? 'bg-alert-orange' : 'bg-alert-blue'
                  )}
                  style={{ width: `${Math.min((area.overtimeCount / Math.max(...areaStats.map(a => a.overtimeCount), 1)) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>{area.occupiedSpots}/{area.totalSpots} 占用</span>
                <span>{area.nightLock ? '🌙 夜间锁定' : ''}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {unreadAlerts.length > 0 && (
        <div className="border-t border-border-default pt-3">
          <p className="text-text-secondary text-xs font-medium mb-2 flex items-center gap-1">
            <Bell className="w-3 h-3 text-alert-orange" />
            实时预警
          </p>
          <div className="space-y-1 max-h-24 overflow-auto">
            {unreadAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'text-xs p-2 border-l-2 cursor-pointer hover:bg-bg-tertiary/50 transition-colors',
                  alert.type === 'danger' ? 'border-alert-red bg-alert-red/5' :
                  alert.type === 'warning' ? 'border-alert-orange bg-alert-orange/5' :
                  alert.type === 'success' ? 'border-alert-green bg-alert-green/5' :
                  'border-alert-blue bg-alert-blue/5'
                )}
                onClick={() => markAlertAsRead(alert.id)}
              >
                <p className={cn(
                  'font-medium',
                  alert.type === 'danger' ? 'text-alert-red' :
                  alert.type === 'warning' ? 'text-alert-orange' :
                  alert.type === 'success' ? 'text-alert-green' :
                  'text-alert-blue'
                )}>
                  {alert.message}
                </p>
                <p className="text-text-muted text-[10px] mt-0.5">{formatDateTime(alert.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
