import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, TrendingUp, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react'
import api from '../lib/api'
import Card from '../components/ui/Card'
import toast from 'react-hot-toast'

export default function LoanChecker() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      monthly_income: 80000,
      employment_type: 'salaried',
      age: 30,
      existing_emi: 0,
      credit_score: 750,
      loan_amount: 500000,
      loan_tenure: 60,
      loan_type: 'personal',
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const payload = {
        monthly_income: Number(data.monthly_income),
        employment_type: data.employment_type,
        age: Number(data.age),
        existing_emi: Number(data.existing_emi),
        credit_score: Number(data.credit_score),
        loan_amount: Number(data.loan_amount),
        loan_tenure: Number(data.loan_tenure),
        loan_type: data.loan_type,
      }
      const { data: res } = await api.post('/loan/check', payload)
      setResult(res)
      toast.success('Loan eligibility checked')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to check eligibility')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div>
        <h1 className="page-title">Loan Eligibility Checker</h1>
        <p className="page-subtitle">Evaluate your borrowing capacity with FOIR, score checks, and AI-guided insights.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="font-semibold mb-6 flex items-center gap-2"><Wallet size={18} className="text-primary-400" /> Application Details</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Monthly Income</label>
              <input type="number" className="form-input" {...register('monthly_income', { required: true, min: 1 })} />
              {errors.monthly_income && <p className="form-error">Required</p>}
            </div>
            <div>
              <label className="form-label">Employment Type</label>
              <select className="form-select" {...register('employment_type')}>
                <option value="salaried">Salaried</option>
                <option value="self_employed">Self Employed</option>
                <option value="business">Business</option>
                <option value="freelancer">Freelancer</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <div>
              <label className="form-label">Age</label>
              <input type="number" className="form-input" {...register('age', { required: true, min: 21, max: 65 })} />
            </div>
            <div>
              <label className="form-label">Existing EMI</label>
              <input type="number" className="form-input" {...register('existing_emi')} />
            </div>
            <div>
              <label className="form-label">Credit Score</label>
              <input type="number" className="form-input" {...register('credit_score', { required: true, min: 300, max: 900 })} />
            </div>
            <div>
              <label className="form-label">Loan Type</label>
              <select className="form-select" {...register('loan_type')}>
                <option value="personal">Personal</option>
                <option value="home">Home</option>
                <option value="car">Car</option>
                <option value="education">Education</option>
                <option value="business">Business</option>
                <option value="gold">Gold</option>
              </select>
            </div>
            <div>
              <label className="form-label">Loan Amount</label>
              <input type="number" className="form-input" {...register('loan_amount', { required: true, min: 1000 })} />
            </div>
            <div>
              <label className="form-label">Tenure (Months)</label>
              <input type="number" className="form-input" {...register('loan_tenure', { required: true, min: 1 })} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? 'Checking…' : 'Check Eligibility'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        </Card>

        <Card className="p-6 min-h-[460px]">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${result.eligible ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                    {result.eligible ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{result.eligible ? 'Eligible for Loan' : 'Needs Improvement'}</h3>
                    <p className="text-xs text-white/40">Approval probability {result.approval_percentage}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-white/40">Max Loan</p>
                    <p className="text-lg font-semibold">₹{Math.round(result.max_loan_amount).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-white/40">Proposed EMI</p>
                    <p className="text-lg font-semibold">₹{Math.round(result.proposed_emi).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-white/40">FOIR</p>
                    <p className="text-lg font-semibold">{result.foir}%</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-white/40">Risk</p>
                    <p className="text-lg font-semibold">{result.risk_level}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-primary-500/10 to-blue-500/10 p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><TrendingUp size={15} className="text-primary-400" /> Suggested Rate</h4>
                  <p className="text-sm text-white/70">{result.suggested_rate}% annual interest rate</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Why this result</h4>
                  <ul className="flex flex-col gap-2 text-sm text-white/70">
                    {result.reasons?.map((reason, i) => <li key={i} className="leading-relaxed">{reason}</li>)}
                  </ul>
                </div>
                {result.improvements?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Improvement Tips</h4>
                    <ul className="flex flex-col gap-2 text-sm text-white/70">
                      {result.improvements.map((item, i) => <li key={i} className="leading-relaxed">• {item}</li>)}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center"><Wallet size={28} className="text-primary-400" /></div>
                <h3 className="font-semibold">Ready to evaluate your loan</h3>
                <p className="text-sm text-white/40 max-w-xs">Fill in your details and instantly see approval probability, FOIR, and improvement tips.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}
