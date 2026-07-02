import Card from '../components/ui/Card'
import { SlidersHorizontal, MoonStar, Shield, Smartphone } from 'lucide-react'

export default function Settings() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Tune your experience for privacy, appearance, and notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><SlidersHorizontal size={16} className="text-primary-400" /> Preferences</h3>
          <div className="flex flex-col gap-3 text-sm text-white/70">
            <label className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2"><span>Dark UI</span><input type="checkbox" defaultChecked className="accent-primary-400" /></label>
            <label className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2"><span>Compact cards</span><input type="checkbox" className="accent-primary-400" /></label>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><MoonStar size={16} className="text-primary-400" /> Display</h3>
          <div className="flex flex-col gap-3 text-sm text-white/70">
            <div className="rounded-xl bg-white/5 px-3 py-2">Navigation is optimized for desktop and mobile views.</div>
            <div className="rounded-xl bg-white/5 px-3 py-2">Charts and summaries auto-adjust to the available space.</div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield size={16} className="text-primary-400" /> Privacy</h3>
          <div className="flex flex-col gap-3 text-sm text-white/70">
            <label className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2"><span>Share analytics</span><input type="checkbox" defaultChecked className="accent-primary-400" /></label>
            <label className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2"><span>Save browsing history</span><input type="checkbox" className="accent-primary-400" /></label>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Smartphone size={16} className="text-primary-400" /> Notifications</h3>
          <div className="flex flex-col gap-3 text-sm text-white/70">
            <label className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2"><span>Credit alerts</span><input type="checkbox" defaultChecked className="accent-primary-400" /></label>
            <label className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2"><span>EMI reminders</span><input type="checkbox" defaultChecked className="accent-primary-400" /></label>
          </div>
        </Card>
      </div>
    </div>
  )
}
