import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  getSchemes, 
  createScheme, 
  updateScheme, 
  deleteScheme, 
  type Scheme 
} from '../schemes/api/schemes';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  X, 
  Layers, 
  Landmark, 
  Calendar, 
  Users, 
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  PlusCircle,
  MinusCircle
} from 'lucide-react';

const schemeFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  state: z.string().nullable().optional().transform(val => val === '' ? null : val),
  minAge: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().int().nonnegative().nullable().optional()
  ),
  maxAge: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().int().nonnegative().nullable().optional()
  ),
  maxIncome: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().int().nonnegative().nullable().optional()
  ),
  gender: z.string().nullable().optional().transform(val => val === '' ? 'ALL' : val),
  occupation: z.string().nullable().optional().transform(val => val === '' ? null : val),
  benefits: z.string().min(5, 'Benefits details must be at least 5 characters'),
  documentsRequired: z.array(z.string()).min(1, 'At least one document is required'),
  applicationUrl: z.string().nullable().optional().or(z.literal('')),
  ministry: z.string().nullable().optional().transform(val => val === '' ? null : val),
  isActive: z.boolean().optional().default(true),
});

type SchemeFormValues = z.infer<typeof schemeFormSchema>;

export const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [deletingSchemeId, setDeletingSchemeId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch schemes
  const { data, isLoading, isError } = useQuery({
    queryKey: ['schemes', { search }],
    queryFn: () => getSchemes({ search, limit: 100 }), // Load more for admin grid search
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schemeFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      state: '',
      minAge: null,
      maxAge: null,
      maxIncome: null,
      gender: 'ALL',
      occupation: '',
      benefits: '',
      documentsRequired: ['Aadhaar Card'],
      applicationUrl: '',
      ministry: '',
      isActive: true,
    },
  });

  // Field array for documents list
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'documentsRequired' as never,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: createScheme,
    onSuccess: () => {
      showToast('Welfare scheme created successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
      setIsModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      showToast(error.response?.data?.error || 'Failed to create scheme.', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateScheme(id, payload),
    onSuccess: () => {
      showToast('Welfare scheme updated successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
      setIsModalOpen(false);
      setEditingScheme(null);
      reset();
    },
    onError: (error: any) => {
      showToast(error.response?.data?.error || 'Failed to update scheme.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteScheme,
    onSuccess: () => {
      showToast('Welfare scheme deleted successfully.', 'success');
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
      setDeletingSchemeId(null);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.error || 'Failed to delete scheme.', 'error');
      setDeletingSchemeId(null);
    },
  });

  const onSubmit = (values: SchemeFormValues) => {
    // Validate url format if it's provided
    let applicationUrl = values.applicationUrl;
    if (applicationUrl && !applicationUrl.startsWith('http://') && !applicationUrl.startsWith('https://')) {
      applicationUrl = `https://${applicationUrl}`;
    }

    const payload = {
      ...values,
      applicationUrl: applicationUrl || null,
      documentsRequired: values.documentsRequired.filter(Boolean),
    };

    if (editingScheme) {
      updateMutation.mutate({ id: editingScheme.id, payload });
    } else {
      createMutation.mutate(payload as any);
    }
  };

  const handleEditClick = (scheme: Scheme) => {
    setEditingScheme(scheme);
    reset({
      title: scheme.title,
      description: scheme.description,
      category: scheme.category,
      state: scheme.state || '',
      minAge: scheme.minAge,
      maxAge: scheme.maxAge,
      maxIncome: scheme.maxIncome,
      gender: scheme.gender || 'ALL',
      occupation: scheme.occupation || '',
      benefits: scheme.benefits,
      documentsRequired: Array.isArray(scheme.documentsRequired) 
        ? scheme.documentsRequired 
        : typeof scheme.documentsRequired === 'string'
          ? JSON.parse(scheme.documentsRequired)
          : ['Aadhaar Card'],
      applicationUrl: scheme.applicationUrl || '',
      ministry: scheme.ministry || '',
      isActive: scheme.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingScheme(null);
    reset({
      title: '',
      description: '',
      category: 'Finance',
      state: '',
      minAge: null,
      maxAge: null,
      maxIncome: null,
      gender: 'ALL',
      occupation: '',
      benefits: '',
      documentsRequired: ['Aadhaar Card'],
      applicationUrl: '',
      ministry: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingSchemeId) {
      deleteMutation.mutate(deletingSchemeId);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F1115] transition-colors duration-300 pt-32 pb-24">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md border ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
        } animate-slideIn`}>
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-gradient-to-tr from-red-500 to-amber-500 text-white rounded-2xl shadow-lg shadow-red-500/15">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Admin Console
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Deploy, edit, and maintain national and state welfare schemes.
              </p>
            </div>
          </div>

          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Scheme</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative flex items-center max-w-md h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden transition-all">
            <div className="grid place-items-center h-full w-12 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              className="peer h-full w-full outline-none text-gray-700 dark:text-gray-200 bg-transparent pr-2 text-sm"
              type="text"
              id="admin-search"
              placeholder="Filter schemes by name, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table & Dashboard Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-blue-600 dark:text-blue-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading administrative roster...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-3xl">
            Roster fetch failed. Please check backend status and refresh.
          </div>
        ) : data?.schemes.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl shadow-md border border-gray-100 dark:border-gray-800 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full grid place-items-center mx-auto mb-6 text-gray-400">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No welfare schemes</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Deploy your first social security scheme right now!</p>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl"
            >
              Add First Scheme
            </button>
          </div>
        ) : (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Scheme Title</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">State scope</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Eligibility Bounds</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data?.schemes.map((scheme) => (
                    <tr 
                      key={scheme.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{scheme.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5 max-w-sm truncate">{scheme.ministry || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                          {scheme.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                          {scheme.state ? `📍 ${scheme.state}` : '🌐 Central Scheme'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex flex-col gap-1 text-xs">
                          {scheme.maxAge && <span>Age: {scheme.minAge || 0}-{scheme.maxAge} yrs</span>}
                          {scheme.maxIncome && <span>Income &lt; ₹{scheme.maxIncome.toLocaleString()}</span>}
                          {scheme.gender && <span>Gender: {scheme.gender}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${
                          scheme.isActive !== false 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                        }`}>
                          {scheme.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(scheme)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                            title="Edit scheme Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingSchemeId(scheme.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                            title="Purge scheme record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Creation & Editing Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-8 animate-zoomIn max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingScheme ? 'Edit Welfare Scheme' : 'Deploy New Welfare Scheme'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-500 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 p-8 space-y-6">
              
              {/* Primary details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Scheme Title</label>
                  <input
                    {...register('title')}
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="Pradhan Mantri Kaushal Vikas Yojana"
                  />
                  {!!errors.title && <p className="text-xs text-red-500 font-semibold">{errors.title.message as string}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Category</label>
                  <select
                    {...register('category')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  >
                    <option value="Finance">Finance / Subsidy</option>
                    <option value="Health">Health & Insurance</option>
                    <option value="Education">Education & Skills</option>
                    <option value="Agriculture">Agriculture & Farming</option>
                    <option value="Housing">Housing & Infrastructure</option>
                    <option value="Employment">Employment & Welfare</option>
                  </select>
                  {!!errors.category && <p className="text-xs text-red-500 font-semibold">{errors.category.message as string}</p>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="Provide comprehensive details about the scheme's goals, scope, and summary..."
                />
                {!!errors.description && <p className="text-xs text-red-500 font-semibold">{errors.description.message as string}</p>}
              </div>

              {/* Scope & Ministry */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Ministry / Dept</label>
                  <input
                    {...register('ministry')}
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="Ministry of Skill Development"
                  />
                  {!!errors.ministry && <p className="text-xs text-red-500 font-semibold">{errors.ministry.message as string}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">State Bounds</label>
                  <input
                    {...register('state')}
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="Leave empty for Central Scheme"
                  />
                  {!!errors.state && <p className="text-xs text-red-500 font-semibold">{errors.state.message as string}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Apply URL</label>
                  <input
                    {...register('applicationUrl')}
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="https://pmkvydashboard.org"
                  />
                  {!!errors.applicationUrl && <p className="text-xs text-red-500 font-semibold">{errors.applicationUrl.message as string}</p>}
                </div>
              </div>

              {/* Eligibility Gates */}
              <div className="p-6 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 space-y-4">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Eligibility Gates Parameters</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">Min Age Requirement</label>
                    <input
                      {...register('minAge')}
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white outline-none text-sm"
                      placeholder="e.g. 18"
                    />
                    {!!errors.minAge && <p className="text-xs text-red-500">{errors.minAge.message as string}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">Max Age Limit</label>
                    <input
                      {...register('maxAge')}
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white outline-none text-sm"
                      placeholder="e.g. 45"
                    />
                    {!!errors.maxAge && <p className="text-xs text-red-500">{errors.maxAge.message as string}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">Max Annual Income</label>
                    <input
                      {...register('maxIncome')}
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white outline-none text-sm"
                      placeholder="₹ Limit"
                    />
                    {!!errors.maxIncome && <p className="text-xs text-red-500">{errors.maxIncome.message as string}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">Gender Eligibility</label>
                    <select
                      {...register('gender')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none text-sm"
                    >
                      <option value="ALL">All Genders</option>
                      <option value="MALE">Male Only</option>
                      <option value="FEMALE">Female Only</option>
                      <option value="OTHER">Other Only</option>
                    </select>
                    {!!errors.gender && <p className="text-xs text-red-500">{errors.gender.message as string}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">Occupation Restriction</label>
                    <input
                      {...register('occupation')}
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white outline-none text-sm"
                      placeholder="e.g. Farmer, Student, Leave empty for All"
                    />
                    {!!errors.occupation && <p className="text-xs text-red-500">{errors.occupation.message as string}</p>}
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      {...register('isActive')}
                      id="isActive"
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Enable scheme immediately for matching quiz roster
                    </label>
                  </div>
                </div>
              </div>

              {/* Benefits details */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Benefits Details</label>
                <textarea
                  {...register('benefits')}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="Provide details of monetary subsidies, insurance coverage, training stipends..."
                />
                {!!errors.benefits && <p className="text-xs text-red-500 font-semibold">{errors.benefits.message as string}</p>}
              </div>

              {/* Required Documents List - Dynamic */}
              <div className="p-6 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>Documents Required checklist</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => append('')}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Document
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <input
                        {...register(`documentsRequired.${index}` as any)}
                        type="text"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                        placeholder="e.g. Income Certificate"
                      />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-gray-400 hover:text-rose-500 transition-colors"
                        title="Remove document requirement"
                      >
                        <MinusCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                {!!errors.documentsRequired && (
                  <p className="text-xs text-red-500 font-semibold">{errors.documentsRequired.message as string}</p>
                )}
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-4 border-t border-gray-100 dark:border-gray-800 pt-6 mt-6 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-2xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20 transition-all text-sm"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span>{editingScheme ? 'Save Updates' : 'Deploy Scheme'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSchemeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-2xl animate-zoomIn">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white text-center mb-2">
              Confirm Scheme Purge
            </h3>
            
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center leading-relaxed mb-6">
              Are you absolutely sure you want to permanently delete this scheme? This action is irreversible and will purge all citizen bookmarks and tracker entries linked to it.
            </p>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDeletingSchemeId(null)}
                className="w-full py-3 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold rounded-2xl transition-colors text-sm"
              >
                No, Keep Scheme
              </button>
              
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/10 text-sm flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, Purge Scheme
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
