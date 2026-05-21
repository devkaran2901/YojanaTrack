import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { matchSchemes } from '../schemes/api/schemes';
import type { MatchEligibilityPayload } from '../schemes/api/schemes';
import { SchemeCard } from '../schemes/components/SchemeCard';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  User, 
  TrendingUp, 
  Briefcase, 
  MapPin, 
  CheckCircle2, 
  HelpCircle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir'
];

const OCCUPATIONS = [
  { value: 'Farmer', label: 'Farmer / Agricultural worker' },
  { value: 'Student', label: 'Student' },
  { value: 'Unemployed', label: 'Unemployed' },
  { value: 'Self Employed', label: 'Self-Employed / Business Owner' },
  { value: 'Salaried', label: 'Salaried Employee' },
  { value: 'Senior Citizen', label: 'Retired / Senior Citizen' },
  { value: 'Artisan', label: 'Artisan / Handicraft worker' },
  { value: 'Other', label: 'Other' }
];

export const EligibilityQuiz = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<MatchEligibilityPayload>({
    age: 25,
    gender: 'MALE',
    income: 150000,
    state: 'Maharashtra',
    occupation: 'Student'
  });

  const mutation = useMutation({
    mutationFn: matchSchemes,
    onSuccess: () => {
      setStep(4);
    }
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else if (step === 3) {
      mutation.mutate(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const resetQuiz = () => {
    setStep(1);
    mutation.reset();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F1115] transition-colors duration-300 pt-32 pb-24">
      {/* Decorative Blur Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/5 rounded-full filter blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/10 dark:bg-purple-600/5 rounded-full filter blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        {step < 4 && (
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
              Yojana<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Match</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-lg">
              Answer 3 simple questions to instantly find all central and state welfare schemes you qualify for.
            </p>
          </div>
        )}

        {/* Progress Bar */}
        {step < 4 && (
          <div className="max-w-xl mx-auto mb-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Step {step} of 3</span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {step === 1 && 'Demographics'}
                {step === 2 && 'Domicile & Income'}
                {step === 3 && 'Occupation'}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 transition-all duration-500 ease-out" 
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Quiz Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 overflow-hidden transition-all duration-300">
          
          {/* STEP 1: DEMOGRAPHICS */}
          {step === 1 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Basic Demographics</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Age Input */}
                <div className="space-y-2">
                  <label htmlFor="age" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    How old are you?
                  </label>
                  <input
                    type="number"
                    id="age"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-950 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Gender Selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Gender Identity
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: g })}
                        className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                          formData.gender === g 
                            ? 'border-blue-600 bg-blue-50/50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {g.charAt(0) + g.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DOMICILE & INCOME */}
          {step === 2 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">State Domicile & Income</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* State Domicile */}
                <div className="space-y-2">
                  <label htmlFor="state" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    State Domicile (Resident State)
                  </label>
                  <div className="relative">
                    <select
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-950 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                    >
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Annual Income */}
                <div className="space-y-2">
                  <label htmlFor="income" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Annual Family Income (₹)
                  </label>
                  <input
                    type="number"
                    id="income"
                    min="0"
                    step="10000"
                    value={formData.income}
                    onChange={(e) => setFormData({ ...formData, income: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-950 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Provide accurate income, as most schemes rely on income ceilings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: OCCUPATION */}
          {step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Primary Occupation</h2>
              </div>

              <div className="space-y-4">
                <label htmlFor="occupation" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  What is your primary profession or occupation?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {OCCUPATIONS.map((occ) => (
                    <button
                      key={occ.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, occupation: occ.value })}
                      className={`p-4 rounded-2xl border text-left font-semibold transition-all flex items-center justify-between ${
                        formData.occupation === occ.value 
                          ? 'border-blue-600 bg-blue-50/30 text-blue-600 dark:border-blue-400 dark:bg-blue-900/10 dark:text-blue-400' 
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{occ.label}</span>
                      {formData.occupation === occ.value && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ELIGIBILITY RESULTS */}
          {step === 4 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center max-w-xl mx-auto mb-10">
                <div className="inline-grid place-items-center w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Perfect Matches Found!</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-md">
                  We compared your profile against all active welfare databases. Here are the customized government schemes you are eligible for:
                </p>
              </div>

              {mutation.data && mutation.data.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {mutation.data.map((scheme) => (
                      <SchemeCard key={scheme.id} scheme={scheme} />
                    ))}
                  </div>
                  
                  <div className="flex justify-center pt-8 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={resetQuiz}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all"
                    >
                      Retake Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Matching Schemes</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                    We couldn't find schemes matching your exact profile. You can retry with a different configuration or view all schemes.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={resetQuiz}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
                    >
                      Try Again
                    </button>
                    <Link
                      to="/schemes"
                      className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all"
                    >
                      Browse All
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          {step < 4 && (
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-8 mt-10">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className={`flex items-center gap-2 px-5 py-3 font-semibold rounded-xl transition-all ${
                  step === 1 
                    ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={mutation.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Matching...</span>
                  </>
                ) : (
                  <>
                    <span>{step === 3 ? 'Match Schemes' : 'Continue'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
