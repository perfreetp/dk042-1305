import { useState, useMemo } from 'react';
import { MapPin, Moon, Settings, ChevronDown, Check, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn, formatDuration } from '../../utils/helpers';
import type { Area, ParkingSpot } from '../../types';

export function AreasWindow() {
  const areas = useAppStore((state) => state.areas);
  const parkingSpots = useAppStore((state) => state.parkingSpots);
  const dispatchRecords = useAppStore((state) => state.dispatchRecords);
  const selectedAreaId = useAppStore((state) => state.selectedAreaId);
  const setSelectedAreaId = useAppStore((state) => state.setSelectedAreaId);
  const toggleNightLock = useAppStore((state) => state.toggleNightLock);
  const updateAreaThresholds = useAppStore((state) => state.updateAreaThresholds);
  const setFilterOptions = useAppStore((state) => state.setFilterOptions);
  const setActiveWindow = useAppStore((state) => state.setActiveWindow);
  const selectRecord = useAppStore((state) => state.selectRecord);

  const [showConfig, setShowConfig] = useState<string | null>(null);
  const [editingThresholds, setEditingThresholds] = useState<{
    overtimeThreshold: number;
    warningThreshold: number;
    towThreshold: number;
  } | null>(null);

  const selectedArea = useMemo(() => {
    return areas.find((a) => a.id === selectedAreaId) || null;
  }, [areas, selectedAreaId]);

  const areaSpots = useMemo(() => {
    if (!selectedAreaId) return [];
    return parkingSpots.filter((s) => s.areaId === selectedAreaId);
  }, [parkingSpots, selectedAreaId]);

  const areaOvertimeRecords = useMemo(() => {
    if (!selectedAreaId) return [];
    return dispatchRecords.filter((r) => r.areaId === selectedAreaId);
  }, [dispatchRecords, selectedAreaId]);

  const getSpotStatusColor = (status: ParkingSpot['status']) => {
    switch (status) {
      case 'available': return 'bg-alert-green/30 border-alert-green/50';
      case 'occupied': return 'bg-alert-blue/30 border-alert-blue/50';
      case 'overtime': return 'bg-alert-red/50 border-alert-red animate-pulse';
      case 'reserved': return 'bg-alert-yellow/30 border-alert-yellow/50';
      default: return 'bg-bg-tertiary border-border-default';
    }
  };

  const handleAreaClick = (area: Area) => {
    if (selectedAreaId === area.id) {
      setSelectedAreaId(null);
    } else {
      setSelectedAreaId(area.id);
      setShowConfig(null);
    }
  };

  const handleSpotClick = (spot: ParkingSpot) => {
    if (spot.status === 'overtime' && spot.currentVehicleId) {
      const record = dispatchRecords.find((r) => r.spotId === spot.id);
      if (record) {
        selectRecord(record.id);
        setActiveWindow('records');
      }
    }
  };

  const handleStartEdit = (area: Area) => {
    setEditingThresholds({
      overtimeThreshold: area.overtimeThreshold,
      warningThreshold: area.warningThreshold,
      towThreshold: area.towThreshold,
    });
    setShowConfig(area.id);
  };

  const handleSaveConfig = (areaId: string) => {
    if (editingThresholds) {
      updateAreaThresholds(areaId, editingThresholds);
      setShowConfig(null);
      setEditingThresholds(null);
    }
  };

  const handleCancelEdit = () => {
    setShowConfig(null);
    setEditingThresholds(null);
  };

  const handleFilterArea = (areaId: string) => {
    setFilterOptions({ areaId });
    setActiveWindow('dispatch');
  };

  const gridSize = useMemo(() => {
    if (areaSpots.length === 0) return { rows: 0, cols: 0 };
    const maxRow = Math.max(...areaSpots.map((s) => s.row)) + 1;
    const maxCol = Math.max(...areaSpots.map((s) => s.col)) + 1;
    return { rows: maxRow, cols: maxCol };
  }, [areaSpots]);

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-text-secondary text-xs">
          共 {areas.length} 个区域，{parkingSpots.filter((s) => s.status === 'overtime').length} 个超时车位
        </p>
      </div>

      <div className="space-y-2">
        {areas.map((area) => {
          const areaOvertimeCount = dispatchRecords.filter((r) => r.areaId === area.id).length;
          const isSelected = selectedAreaId === area.id;
          const isExpanded = showConfig === area.id;

          return (
            <div key={area.id} className="card overflow-hidden">
              <div
                className={cn(
                  'p-3 cursor-pointer transition-all',
                  isSelected && 'bg-alert-orange/10 border-l-2 border-l-alert-orange',
                  'hover:bg-bg-tertiary/50'
                )}
                onClick={() => handleAreaClick(area)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded flex items-center justify-center',
                      area.nightLock ? 'bg-alert-blue/20 text-alert-blue' : 'bg-bg-tertiary text-text-muted'
                    )}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary font-medium text-sm">{area.name}</span>
                        {area.nightLock && (
                          <span className="flex items-center gap-1 text-xs text-alert-blue">
                            <Moon className="w-3 h-3" />
                            夜间锁定
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                        <span>总车位 {area.totalSpots}</span>
                        <span>已占 {area.occupiedSpots}</span>
                        <span className={areaOvertimeCount > 0 ? 'text-alert-orange' : ''}>
                          超时 {areaOvertimeCount}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1.5 hover:bg-bg-tertiary rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(area);
                      }}
                    >
                      <Settings className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-bg-tertiary rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterArea(area.id);
                      }}
                    >
                      筛选
                    </button>
                    <ChevronDown className={cn(
                      'w-4 h-4 text-text-muted transition-transform',
                      isSelected && 'rotate-180'
                    )} />
                  </div>
                </div>

                <div className="h-1.5 bg-bg-tertiary mt-2 overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      areaOvertimeCount > 5 ? 'bg-alert-red' : areaOvertimeCount > 2 ? 'bg-alert-orange' : 'bg-alert-green'
                    )}
                    style={{ width: `${(areaOvertimeCount / Math.max(area.overtimeSpots, 1)) * 100}%` }}
                  />
                </div>
              </div>

              {isExpanded && editingThresholds && (
                <div className="p-3 bg-bg-primary border-t border-border-default animate-fade-in">
                  <h5 className="text-text-secondary text-xs font-medium mb-3">阈值配置（分钟）</h5>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-text-muted text-xs mb-1 block">超时阈值</label>
                      <input
                        type="number"
                        className="input-field text-sm"
                        value={editingThresholds.overtimeThreshold}
                        onChange={(e) => setEditingThresholds({
                          ...editingThresholds,
                          overtimeThreshold: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-text-muted text-xs mb-1 block">警告阈值</label>
                      <input
                        type="number"
                        className="input-field text-sm"
                        value={editingThresholds.warningThreshold}
                        onChange={(e) => setEditingThresholds({
                          ...editingThresholds,
                          warningThreshold: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-text-muted text-xs mb-1 block">拖移阈值</label>
                      <input
                        type="number"
                        className="input-field text-sm"
                        value={editingThresholds.towThreshold}
                        onChange={(e) => setEditingThresholds({
                          ...editingThresholds,
                          towThreshold: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary text-sm">夜间锁定</span>
                      <button
                        className={cn(
                          'relative w-10 h-5 rounded-full transition-colors',
                          area.nightLock ? 'bg-alert-blue' : 'bg-bg-tertiary'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNightLock(area.id);
                        }}
                      >
                        <div className={cn(
                          'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                          area.nightLock ? 'left-5' : 'left-0.5'
                        )} />
                      </button>
                    </div>
                    {area.nightLock && (
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span>锁定时段：{area.nightLockStartTime} - {area.nightLockEndTime}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <button className="btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}>
                      <X className="w-3 h-3 mr-1" />
                      取消
                    </button>
                    <button className="btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleSaveConfig(area.id); }}>
                      <Check className="w-3 h-3 mr-1" />
                      保存
                    </button>
                  </div>
                </div>
              )}

              {isSelected && !isExpanded && (
                <div className="p-3 bg-bg-primary border-t border-border-default animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-text-secondary text-xs font-medium">车位布局</h5>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-alert-green/50" /> 空闲
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-alert-blue/50" /> 占用
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-alert-red/50 animate-pulse" /> 超时
                      </span>
                    </div>
                  </div>

                  {gridSize.rows > 0 ? (
                    <div
                      className="grid gap-1"
                      style={{
                        gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))`,
                      }}
                    >
                      {Array.from({ length: gridSize.rows * gridSize.cols }).map((_, idx) => {
                        const row = Math.floor(idx / gridSize.cols);
                        const col = idx % gridSize.cols;
                        const spot = areaSpots.find((s) => s.row === row && s.col === col);

                        if (!spot) {
                          return <div key={idx} className="aspect-[2/1]" />;
                        }

                        const hasRecord = areaOvertimeRecords.find((r) => r.spotId === spot.id);

                        return (
                          <div
                            key={spot.id}
                            className={cn(
                              'aspect-[2/1] border flex items-center justify-center text-[8px] font-mono cursor-pointer transition-all hover:scale-105',
                              getSpotStatusColor(spot.status)
                            )}
                            onClick={() => handleSpotClick(spot)}
                            title={spot.currentPlate || spot.spotNumber}
                          >
                            <span className="truncate px-0.5">
                              {spot.currentPlate || spot.spotNumber.slice(-3)}
                            </span>
                            {hasRecord && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-alert-red rounded-full animate-pulse" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-text-muted text-xs text-center py-4">暂无车位数据</p>
                  )}

                  {areaOvertimeRecords.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border-default">
                      <h5 className="text-text-secondary text-xs font-medium mb-2">超时车辆</h5>
                      <div className="space-y-1 max-h-24 overflow-auto">
                        {areaOvertimeRecords.map((record) => (
                          <div
                            key={record.id}
                            className="flex items-center justify-between p-2 bg-bg-secondary rounded text-xs cursor-pointer hover:bg-bg-tertiary transition-colors"
                            onClick={() => {
                              selectRecord(record.id);
                              setActiveWindow('records');
                            }}
                          >
                            <span className="font-mono">{record.vehicle.plateNumber}</span>
                            <span className="text-text-secondary">{record.spotNumber}</span>
                            <span className={cn(
                              'font-mono',
                              record.overtimeMinutes > 1440 ? 'text-alert-red' : 'text-alert-orange'
                            )}>
                              {formatDuration(record.overtimeMinutes)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
