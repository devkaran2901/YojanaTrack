import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from './api/profile';
import { 
  User, 
  MapPin, 
  Briefcase, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';

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

export const ProfilePage = () => {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    age: 25,
    gender: 'MALE',
    income: 150000,
    state: 'Maharashtra',
    occupation: 'Student'
  });

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        age: profile.age ?? 25,
        gender: profile.gender ?? 'MALE',
        income: profile.income ?? 150000,
        state: profile.state ?? 'Maharashtra',
        occupation: profile.occupation ?? 'Student'
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F1115] flex flex-col items-center justify-center text-blue-600 dark:text-blue-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading your profile...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F1115] flex flex-col items-center justify-center p-4">
        <div className="text-center py-8 px-6 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl max-w-md shadow-sm border border-red-100 dark:border-red-900/30">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Profile</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We couldn't fetch your profile details. Please try logging in again or refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F1115] transition-colors duration-300 pt-32 pb-24">
      {/* Decorative Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/5 rounded-full filter blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full filter blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Profile</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-lg">
            Manage your personal profile details to optimize scheme matching and notifications.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 overflow-hidden transition-all duration-300">
          <div className="flex items-center gap-4 pb-8 mb-8 border-b border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20">
              {profile?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{profile?.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">{profile?.email}</p>
            </div>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-xl border border-green-100 dark:border-green-900/30 flex items-center gap-2 text-sm font-semibold animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {updateMutation.isError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-2 text-sm font-semibold animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>
                {((updateMutation.error as any)?.response?.data?.error) || 'Failed to update profile. Please check validation requirements.'}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Age */}
              <div className="space-y-2">
                <label htmlFor="age" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Age (Years)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="age"
                    min="0"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-950 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center text-gray-400 pointer-events-none">
                    <User className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Gender */}
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

              {/* State */}
              <div className="space-y-2">
                <label htmlFor="state" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  State Domicile
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

              {/* Income */}
              <div className="space-y-2">
                <label htmlFor="income" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Annual Family Income (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="income"
                    min="0"
                    step="10000"
                    value={formData.income}
                    onChange={(e) => setFormData({ ...formData, income: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-950 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center text-gray-400 pointer-events-none">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Occupation */}
            <div className="space-y-4">
              <label htmlFor="occupation" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Primary Profession or Occupation
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
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      <span>{occ.label}</span>
                    </div>
                    {formData.occupation === occ.value && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
