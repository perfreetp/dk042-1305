import { useState, useEffect } from 'react';
import {
  Shield,
  User,
  Lock,
  LogIn,
  AlertTriangle,
  Car,
  Clock,
  MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function Login() {
  const [employeeNo, setEmployeeNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAppStore((state) => state.login);
  const currentUser = useAppStore((state) => state.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!employeeNo.trim()) {
      setError('请输入工号');
      return;
    }

    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = login(employeeNo.trim().toUpperCase());

    if (success) {
      navigate('/dashboard');
    } else {
      setError('登录失败，请检查工号和密码');
    }

    setIsLoading(false);
  };

  const demoAccounts = [
    { no: 'G001', name: '李明', role: '值班员' },
    { no: 'G002', name: '王芳', role: '值班员' },
    { no: 'L001', name: '张军', role: '班长' },
    { no: 'M001', name: '赵总', role: '主管' },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center bg-bg-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-br from-alert-orange/5 via-transparent to-alert-blue/5" />

      <div className="absolute top-20 left-20 w-64 h-64 bg-alert-orange/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-alert-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 w-full max-w-5xl flex gap-8 items-center">
        <div className="flex-1 hidden lg:block">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-lg bg-alert-orange/20 flex items-center justify-center border border-alert-orange/30">
              <Shield className="w-8 h-8 text-alert-orange" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display text-text-primary tracking-wider">
                安保值守看板
              </h1>
              <p className="text-text-muted text-sm">Parking Security Command Center</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            疑似僵尸车与长期占位车
            <br />
            <span className="text-alert-orange">现场处置管理系统</span>
          </h2>

          <p className="text-text-muted mb-8 leading-relaxed">
            面向商场、园区和写字楼安保班组的桌面端值守系统，
            聚焦超时车辆的快速发现、快速派单、快速闭环，
            提升泊位周转率，保障停车场有序运行。
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-bg-secondary/50 border border-border-default rounded-lg p-4">
              <div className="w-10 h-10 rounded-lg bg-alert-orange/20 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-alert-orange" />
              </div>
              <p className="text-text-primary font-medium text-sm">超时监测</p>
              <p className="text-text-muted text-xs mt-1">自动识别超时车辆</p>
            </div>
            <div className="bg-bg-secondary/50 border border-border-default rounded-lg p-4">
              <div className="w-10 h-10 rounded-lg bg-alert-blue/20 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-alert-blue" />
              </div>
              <p className="text-text-primary font-medium text-sm">精准定位</p>
              <p className="text-text-muted text-xs mt-1">区域车位精确导航</p>
            </div>
            <div className="bg-bg-secondary/50 border border-border-default rounded-lg p-4">
              <div className="w-10 h-10 rounded-lg bg-alert-green/20 flex items-center justify-center mb-3">
                <Car className="w-5 h-5 text-alert-green" />
              </div>
              <p className="text-text-primary font-medium text-sm">快速闭环</p>
              <p className="text-text-muted text-xs mt-1">全流程跟踪管理</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-text-muted text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-alert-green rounded-full animate-pulse" />
              <span>系统运行正常</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-alert-blue rounded-full" />
              <span>版本 v1.0.0</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="card p-8 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-alert-orange via-alert-yellow to-alert-orange" />

            <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
              <div className="w-12 h-12 rounded-lg bg-alert-orange/20 flex items-center justify-center border border-alert-orange/30">
                <Shield className="w-7 h-7 text-alert-orange" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display text-text-primary">安保值守看板</h1>
                <p className="text-text-muted text-xs">Parking Security Command Center</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-text-primary mb-2">账号登录</h3>
            <p className="text-text-muted text-sm mb-6">请输入您的工号和密码登录系统</p>

            {error && (
              <div className="bg-alert-red/10 border border-alert-red/30 rounded-lg p-3 mb-6 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-alert-red flex-shrink-0 mt-0.5" />
                <p className="text-alert-red text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  工号
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    value={employeeNo}
                    onChange={(e) => setEmployeeNo(e.target.value)}
                    placeholder="请输入工号，如 G001"
                    className="input-field pl-10"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码（任意密码即可）"
                    className="input-field pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>登录中...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>登录系统</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border-default">
              <p className="text-text-muted text-xs mb-3">演示账号（点击快速登录）：</p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.no}
                    onClick={() => {
                      setEmployeeNo(acc.no);
                      setPassword('demo');
                    }}
                    className="text-left px-3 py-2 bg-bg-tertiary/50 hover:bg-bg-tertiary border border-border-default rounded-lg transition-colors"
                  >
                    <p className="text-text-primary text-sm font-medium">{acc.name}</p>
                    <p className="text-text-muted text-xs">
                      {acc.no} · {acc.role}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-text-muted text-xs text-center mt-6">
              登录即表示您同意《用户协议》和《隐私政策》
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
