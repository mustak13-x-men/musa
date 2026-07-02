import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { BrainCircuit, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'
import api from '../lib/api'
import Card from '../components/ui/Card'
import toast from 'react-hot-toast'

export default function Advisor() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      monthly_income: 80000,
      monthly_expenses: 45000,
      savings: 15000,
      existing_loans: 12000,
      credit_score: 750,
      age: 30,
      employment_type: 'salaried',
      dependents: 1,
      goals: 'financial independence',
      risk_appetite: 'moderate',
      investments: 10000,
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const payload = {
        monthly_income: Number(data.monthly_income),
        monthly_expenses: Number(data.monthly_expenses),
        savings: Number(data.savings),
        existing_loans: Number(data.existing_loans),
        credit_score: Number(data.credit_score),
        age: Number(data.age),
        employment_type: data.employment_type,
        dependents: Number(data.dependents),
        goals: data.goals,
        risk_appetite: data.risk_appetite,
        investments: Number(data.investments),
      }
      const { data: res } = await api.post('/advisor/analyze', payload)
      setResult(res)
      toast.success('Financial advice generated')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not generate advice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div>
        <h1 className="page-title">AI Financial Advisor</h1>
        <p className="page-subtitle">Get practical guidance for budgeting, investments, debt reduction, and retirement planning.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="font-semibold mb-6 flex items-center gap-2"><BrainCircuit size={18} className="text-primary-400" /> Your Financial Profile</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="form-label">Monthly Income</label><input type="number" className="form-input" {...register('monthly_income', { required: true, min: 1 })} /></div>
            <div><label className="form-label">Monthly Expenses</label><input type="number" className="form-input" {...register('monthly_expenses', { required: true, min: 1 })} /></div>
            <div><label className="form-label">Existing Savings</label><input type="number" className="form-input" {...register('savings')} /></div>
            <div><label className="form-label">Existing Loans EMI</label><input type="number" className="form-input" {...register('existing_loans')} /></div>
            <div><label className="form-label">Credit Score</label><input type="number" className="form-input" {...register('credit_score')} /></div>
            <div><label className="form-label">Age</label><input type="number" className="form-input" {...register('age')} /></div>
            <div><label className="form-label">Employment Type</label><select className="form-select" {...register('employment_type')}><option value="salaried">Salaried</option><option value="self_employed">Self Employed</option><option value="business">Business</option><option value="freelancer">Freelancer</option><option value="retired">Retired</option></select></div>
            <div><label className="form-label">Dependents</label><input type="number" className="form-input" {...register('dependents')} /></div>
            <div><label className="form-label">Goals</label><input className="form-input" {...register('goals')} /></div>
            <div><label className="form-label">Risk Appetite</label><select className="form-select" {...register('risk_appetite')}><option value="conservative">Conservative</option><option value="moderate">Moderate</option><option value="aggressive">Aggressive</option></select></div>
            <div><label className="form-label">Current Investments</label><input type="number" className="form-input" {...register('investments')} /></div>
            <div className="md:col-span-2"><button type="submit" disabled={loading} className="btn-primary w-full justify-center">{loading ? 'Generating…' : 'Generate Advice'}{!loading && <ArrowRight size={16} />}</button></div>
          </form>
        </Card>

        <Card className="p-6 min-h-[460px]">
          {result ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/15 text-primary-400 flex items-center justify-center"><Sparkles size={18} /></div>
                <div>
                  <h3 className="font-semibold">Financial Health Score</h3>
                  <p className="text-xs text-white/40">Your AI-guided plan is ready</p>
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-primary-500/10 to-blue-500/10 p-4">
                <p className="text-3xl font-bold font-display text-primary-300">{result.health_score}/100</p>
                <p className="text-sm text-white/70 mt-2">{result.health_summary}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Savings Tips</h4>
                <ul className="flex flex-col gap-2 text-sm text-white/70">{result.savings_tips?.map((tip, i) => <li key={i}>• {tip}</li>)}</ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Debt Plan</h4>
                <ul className="flex flex-col gap-2 text-sm text-white/70">{result.debt_plan?.map((step, i) => <li key={i}>• {step}</li>)}</ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2"><ShieldCheck size={15} className="text-green-400" /> Emergency Fund</h4>
                <p className="text-sm text-white/70">Target: ₹{Math.round(result.emergency_fund?.target || 0).toLocaleString('en-IN')} • Recommendation: {result.emergency_fund?.recommendation}</p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center"><BrainCircuit size={28} className="text-primary-400" /></div>
              <h3 className="font-semibold">AI advice is ready</h3>
              <p className="text-sm text-white/40 max-w-xs">Enter your financial profile to receive a personalized savings, debt, and investment plan.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
