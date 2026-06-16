import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  FileText,
  MapPin,
  LogOut,
  Bell,
  User,
  Shield,
  Clock,
  ChevronDown,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { DraggableWindow } from '../components/DraggableWindow';
import { OverviewWindow } from '../components/windows/OverviewWindow';
import { DispatchWindow } from '../components/windows/DispatchWindow';
import { RecordsWindow } from '../components/windows/RecordsWindow';
import { AreasWindow } from '../components/windows/AreasWindow';
import { HandoverWindow } from '../components/windows/HandoverWindow';
import { formatTime, cn } from '../utils/helpers';
import type { WindowKey, Alert } from '../types';

const WINDOW_CONFIG: Record<WindowKey, { title: string; icon: React.ReactNode }> = {
  overview: { title: '总览', icon: <LayoutDashboard className="w-4 h-4" /> },
  dispatch: { title: '处置队列', icon: <ListTodo className="w-4 h-4" /> },
  records: { title: '现场记录', icon: <FileText className="w-4 h-4" /> },
  areas: { title: '重点区域', icon: <MapPin className="w-4 h-4" /> },
  handover: { title: '交接班', icon: <LogOut className="w-4 h-4" /> },
};

export default function Dashboard() {
  const currentUser = useAppStore((state) => state.currentUser);
  const currentShift = useAppStore((state) => state.currentShift);
  const dispatchRecords = useAppStore((state) => state.dispatchRecords);
  const alerts = useAppStore((state) => state.alerts);
  const windowPositions = useAppStore((state) => state.windowPositions);
  const restoreWindow = useAppStore((state) => state.restoreWindow);
  const bringWindowToFront = useAppStore((state) => state.bringWindowToFront);
  const markAlertAsRead = useAppStore((state) => state.markAlertAsRead);
  const clearAllAlerts = useAppStore((state) => state.clearAllAlerts);
  const addAlert = useAppStore((state) => state.addAlert);
  const logout = useAppStore((state) => state.logout);
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAlerts, setShowAlerts] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (dispatchRecords.length > 0 && alerts.length === 0) {
      const urgentCount = dispatchRecords.filter((r) => r.priority === 'urgent').length;
      if (urgentCount > 0) {
        addAlert({
          type: 'danger',
          message: `发现 ${urgentCount} 辆紧急超时车辆，请立即处理！`,
        });
      }
    }
  }, [dispatchRecords, alerts.length, addAlert]);

  const unreadAlerts = useMemo(() => alerts.filter((a) => !a.read), [alerts]);

  const minimizedWindows = useMemo(
    () =>
      (Object.keys(windowPositions) as WindowKey[]).filter(
        (key) => windowPositions[key].isMinimized
      ),
    [windowPositions]
  );

  const stats = useMemo(() => {
    const pending = dispatchRecords.filter((r) => r.status === 'pending').length;
    const urgent = dispatchRecords.filter((r) => r.priority === 'urgent').length;
    return { pending, urgent, total: dispatchRecords.length };
  }, [dispatchRecords]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-4 h-4 text-alert-red" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-alert-yellow" />;
      case 'success':
        return <Check className="w-4 h-4 text-alert-green" />;
      default:
        return <Bell className="w-4 h-4 text-alert-blue" />;
    }
  };

  const getAlertBg = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return 'bg-alert-red/10 border-alert-red/30';
      case 'warning':
        return 'bg-alert-yellow/10 border-alert-yellow/30';
      case 'success':
        return 'bg-alert-green/10 border-alert-green/30';
      default:
        return 'bg-alert-blue/10 border-alert-blue/30';
    }
  };

  if (!currentUser || !currentShift) {
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col bg-bg-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <header className="h-14 bg-bg-secondary border-b border-border-default flex items-center justify-between px-6 relative z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-alert-orange/20 flex items-center justify-center border border-alert-orange/30">
              <Shield className="w-5 h-5 text-alert-orange" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display text-text-primary tracking-wide">
                安保值守看板
              </h1>
              <p className="text-text-muted text-xs -mt-0.5">Parking Security Command Center</p>
            </div>
          </div>

          <div className="h-6 w-px bg-border-default" />

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-alert-green rounded-full animate-pulse" />
              <span className="text-text-muted text-sm">系统运行正常</span>
            </div>
            <div className="flex items-center gap-2 text-text-primary">
              <Clock className="w-4 h-4 text-alert-orange" />
              <span className="data-display text-lg font-mono">{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {stats.urgent > 0 && (
            <div className="bg-alert-red/10 border border-alert-red/30 px-3 py-1.5 rounded-lg flex items-center gap-2 animate-pulse-fast">
              <AlertTriangle className="w-4 h-4 text-alert-red" />
              <span className="text-alert-red text-sm font-medium">
                {stats.urgent} 辆紧急
              </span>
            </div>
          )}

          {stats.pending > 0 && (
            <div className="bg-alert-yellow/10 border border-alert-yellow/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Clock className="w-4 h-4 text-alert-yellow" />
              <span className="text-alert-yellow text-sm font-medium">
                {stats.pending} 辆待派单
              </span>
            </div>
          )}

          <div className="h-6 w-px bg-border-default" />

          <div className="relative">
            <button
              onClick={() => {
                setShowAlerts(!showAlerts);
                setShowUserMenu(false);
              }}
              className="relative p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-text-secondary" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-alert-red text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
                </span>
              )}
            </button>

            {showAlerts && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-bg-secondary border border-border-default shadow-lg z-50">
                <div className="flex items-center justify-between p-3 border-b border-border-default">
                  <h4 className="text-text-primary font-semibold text-sm">通知中心</h4>
                  {unreadAlerts.length > 0 && (
                    <button
                      onClick={clearAllAlerts}
                      className="text-text-muted text-xs hover:text-alert-orange transition-colors"
                    >
                      全部已读
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-10 h-10 text-text-muted/30 mx-auto mb-2" />
                      <p className="text-text-muted text-sm">暂无通知</p>
                    </div>
                  ) : (
                    alerts.slice(0, 10).map((alert) => (
                      <div
                        key={alert.id}
                        className={cn(
                          'p-3 border-b border-border-default cursor-pointer hover:bg-bg-tertiary/50 transition-colors',
                          getAlertBg(alert.type),
                          !alert.read && 'border-l-2 border-l-alert-orange'
                        )}
                        onClick={() => markAlertAsRead(alert.id)}
                      >
                        <div className="flex items-start gap-2">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-text-primary text-sm">{alert.message}</p>
                            <p className="text-text-muted text-xs mt-1">
                              {formatTime(alert.timestamp)}
                            </p>
                          </div>
                          {!alert.read && (
                            <div className="w-2 h-2 bg-alert-orange rounded-full mt-1.5" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowAlerts(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-bg-tertiary rounded-lg transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-alert-orange/20 flex items-center justify-center">
                <User className="w-4 h-4 text-alert-orange" />
              </div>
              <div className="text-left">
                <p className="text-text-primary text-sm font-medium">{currentUser.name}</p>
                <p className="text-text-muted text-xs">
                  {currentUser.role === 'guard'
                    ? '值班员'
                    : currentUser.role === 'leader'
                    ? '班长'
                    : '主管'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-bg-secondary border border-border-default shadow-lg z-50">
                <div className="p-2 border-b border-border-default">
                  <div className="px-2 py-2">
                    <p className="text-text-primary text-sm font-medium">{currentUser.name}</p>
                    <p className="text-text-muted text-xs">工号: {currentUser.employeeNo}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-text-secondary hover:text-alert-red hover:bg-alert-red/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">退出登录</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        {(Object.keys(WINDOW_CONFIG) as WindowKey[]).map((key) => (
          <DraggableWindow
            key={key}
            id={key}
            title={WINDOW_CONFIG[key].title}
            icon={WINDOW_CONFIG[key].icon}
          >
            {key === 'overview' && <OverviewWindow />}
            {key === 'dispatch' && <DispatchWindow />}
            {key === 'records' && <RecordsWindow />}
            {key === 'areas' && <AreasWindow />}
            {key === 'handover' && <HandoverWindow />}
          </DraggableWindow>
        ))}
      </div>

      {minimizedWindows.length > 0 && (
        <footer className="h-10 bg-bg-secondary border-t border-border-default flex items-center gap-2 px-4">
          <span className="text-text-muted text-xs mr-2">已最小化:</span>
          {minimizedWindows.map((key) => (
            <button
              key={key}
              onClick={() => {
                restoreWindow(key);
                bringWindowToFront(key);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-bg-tertiary hover:bg-bg-tertiary/80 border border-border-default transition-colors"
            >
              {WINDOW_CONFIG[key].icon}
              <span className="text-text-primary text-sm">{WINDOW_CONFIG[key].title}</span>
            </button>
          ))}
        </footer>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-bg-secondary border border-border-default w-96 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-primary font-semibold text-lg">确认退出</h3>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="p-1 hover:bg-bg-tertiary rounded transition-colors"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            <p className="text-text-muted text-sm mb-6">
              确定要退出系统吗？未完成的交接班事项将被保留。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button onClick={handleLogout} className="btn-danger flex-1">
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
