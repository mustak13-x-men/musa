import Card from '../components/ui/Card'
import { UserCircle2, ShieldCheck, BellRing, Wallet2 } from 'lucide-react'

export default function Profile() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account details and protect your financial preferences.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/15 text-primary-300 flex items-center justify-center"><UserCircle2 size={28} /></div>
            <div>
              <h3 className="font-semibold">Demo User</h3>
              <p className="text-sm text-white/40">demo@finwise.ai</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs uppercase tracking-[0.2em] text-white/35">Plan</p><p className="mt-2 font-semibold">Premium</p></div>
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs uppercase tracking-[0.2em] text-white/35">KYC Status</p><p className="mt-2 font-semibold text-green-400">Verified</p></div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-primary-400" /> Security</h3>
          <div className="flex flex-col gap-3 text-sm text-white/70">
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2"><span>Two-factor authentication</span><span className="text-green-400">Enabled</span></div>
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2"><span>Bank-level encryption</span><span className="text-green-400">Active</span></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><BellRing size={16} className="text-primary-400" /> Alerts</h3>
          <p className="text-sm text-white/60">Get notified about EMI due dates, credit score updates, and loan approval opportunities.</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Wallet2 size={16} className="text-primary-400" /> Financial Goals</h3>
          <p className="text-sm text-white/60">Your next milestone is building a six-month emergency fund and reducing high-interest debt.</p>
        </Card>
      </div>
    </div>
  )
}
