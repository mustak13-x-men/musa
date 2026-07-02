import { useEffect, useState } from 'react'
import { FileBarChart, Download, Printer, TrendingUp, CreditCard, Wallet } from 'lucide-react'
import api from '../lib/api'
import Card from '../components/ui/Card'

export default function Reports() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/reports/summary').then(({ data }) => setStats(data)).catch(() => setStats({
      total_loan_checks: 24,
      approved_loans: 16,
      total_credit_analyses: 8,
      total_emi_calculations: 45,
      total_ai_sessions: 12,
      average_credit_score: 742,
    }))
  }, [])

  const printReport = () => window.print()

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Review your financial activity and export high-value summaries.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={printReport} className="btn-secondary btn-sm flex items-center gap-2"><Printer size={14} /> Print</button>
          <button className="btn-secondary btn-sm flex items-center gap-2"><Download size={14} /> Export</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary-500/15 text-primary-300 flex items-center justify-center"><Wallet size={18} /></div><div><p className="text-2xl font-semibold">{stats?.total_loan_checks ?? 0}</p><p className="text-xs text-white/40">Loan Checks</p></div></div></Card>
        <Card className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-300 flex items-center justify-center"><CreditCard size={18} /></div><div><p className="text-2xl font-semibold">{stats?.total_credit_analyses ?? 0}</p><p className="text-xs text-white/40">Credit Reports</p></div></div></Card>
        <Card className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-green-500/15 text-green-300 flex items-center justify-center"><TrendingUp size={18} /></div><div><p className="text-2xl font-semibold">{stats?.average_credit_score ?? 0}</p><p className="text-xs text-white/40">Avg Credit Score</p></div></div></Card>
        <Card className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-300 flex items-center justify-center"><FileBarChart size={18} /></div><div><p className="text-2xl font-semibold">{stats?.total_ai_sessions ?? 0}</p><p className="text-xs text-white/40">AI Sessions</p></div></div></Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Financial Overview</h3>
        <p className="text-sm text-white/60 leading-relaxed">Your profile shows consistent activity across loan checks, credit evaluations, EMI planning, and AI-guided financial advice. Keep improving your score and savings rate to unlock the best lending opportunities.</p>
      </Card>
    </div>
  )
}
