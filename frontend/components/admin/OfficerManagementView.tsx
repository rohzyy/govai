"use client";
import { useState, useEffect } from 'react';
import { UserPlus, X, Search, Edit, Trash2, User, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import OfficerPerformanceModal from './OfficerPerformanceModal';

interface Officer {
    id: number;
    employee_id: string;
    name: string;
    designation: string;
    department_id: number;
    ward: string;
    zone?: string;
    circle?: string;
    status: string;
    email?: string;
    phone?: string;
    created_at: string;
}

interface Department {
    id: number;
    name: string;
}

export default function OfficerManagementView() {
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [performanceModalOpen, setPerformanceModalOpen] = useState(false);
    const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        employee_id: '',
        name: '',
        designation: 'JE',
        department_id: '',
        ward: '',
        zone: '',
        circle: '',
        email: '',
        phone: '',
        status: 'Active'
    });

    const [isEditMode, setIsEditMode] = useState(false);
    const [editOfficerId, setEditOfficerId] = useState<number | null>(null);

    useEffect(() => {
        fetchOfficers();
        fetchDepartments();
    }, []);

    const fetchOfficers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/admin/officers', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include' // CRITICAL: Send Cookies as fallback
            });

            if (response.ok) {
                const data = await response.json();
                setOfficers(data);
            }
        } catch (error) {
            console.error('Failed to fetch officers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/admin/departments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        }
    };

    const handleSaveOfficer = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // 1. Try LocalStorage
            let token = localStorage.getItem('access_token');
            console.log('[CreateOfficer] Token from LocalStorage:', token ? 'FOUND' : 'MISSING');

            // 2. Fallback: Try Cookie (since api.ts uses it)
            if (!token) {
                const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
                if (match) {
                    token = match[2];
                    console.log('[CreateOfficer] Token found in Cookie (Fallback)');
                }
            }

            console.log('[CreateOfficer] Final Token present:', !!token);

            if (!token) {
                alert('Authentication error: No session token found. Please logout and login again.');
                return;
            }

            const requestData = {
                ...formData,
                department_id: parseInt(formData.department_id)
            };

            // BYPASS PROXY FOR DEBUGGING
            // const url = '/api/admin/officers';
            const url = '/api/admin/officers';

            console.log('[DEBUG] Token:', token);
            console.log('[DEBUG] URL:', url);
            console.log('[DEBUG] Body:', JSON.stringify(requestData));

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                alert(isEditMode ? 'Officer updated successfully' : 'Officer created successfully');
                setIsCreateModalOpen(false);
                fetchOfficers();
                resetForm();
            } else {
                const errorData = await response.json();
                console.error(`Save officer failed (Status: ${response.status}):`, errorData);
                const errorMessage = typeof errorData.error === 'string'
                    ? errorData.error
                    : JSON.stringify(errorData.error || errorData.detail || 'Unknown error');
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Operation failed:', error);
            alert(`Failed to save officer: ${(error as Error).message}`);
        }
    };

    const resetForm = () => {
        setFormData({
            employee_id: '',
            name: '',
            designation: 'JE',
            department_id: '',
            ward: '',
            zone: '',
            circle: '',
            email: '',
            phone: '',
            status: 'Active'
        });
        setIsEditMode(false);
        setEditOfficerId(null);
    };

    const getDesignationBadgeColor = (designation: string) => {
        switch (designation) {
            case 'JE': return 'bg-blue-900/30 text-blue-400 border-blue-700';
            case 'AE': return 'bg-purple-900/30 text-purple-400 border-purple-700';
            case 'EE': return 'bg-indigo-900/30 text-indigo-400 border-indigo-700';
            case 'SE': return 'bg-pink-900/30 text-pink-400 border-pink-700';
            case 'Inspector': return 'bg-green-900/30 text-green-400 border-green-700';
            default: return 'bg-gray-900/30 text-gray-400 border-gray-700';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'text-green-400';
            case 'On Leave': return 'text-yellow-400';
            case 'Suspended': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Officer Management</h2>
                    <p className="text-gray-400">Create and manage government officers (JE, AE, EE, Inspector)</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setIsCreateModalOpen(true);
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                >
                    <UserPlus className="h-5 w-5" />
                    Create New Officer
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-400">Loading officers...</div>
                </div>
            ) : officers.length === 0 ? (
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
                    <User className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 text-lg">No officers found</p>
                    <p className="text-gray-500 text-sm mt-2">Create your first officer to start assigning grievances</p>
                    <button
                        onClick={() => {
                            resetForm();
                            setIsCreateModalOpen(true);
                        }}
                        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all inline-flex items-center gap-2"
                    >
                        <UserPlus className="h-5 w-5" />
                        Create New Officer
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {officers.map((officer) => (
                        <div
                            key={officer.id}
                            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-1">
                                        {officer.name}
                                    </h3>
                                    <p className="text-sm text-gray-400 font-mono mb-2">
                                        {officer.employee_id}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDesignationBadgeColor(officer.designation)}`}>
                                    {officer.designation}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="text-sm">
                                    <span className="text-gray-500">Ward:</span>
                                    <span className="text-white ml-2">{officer.ward}</span>
                                </div>
                                {officer.zone && (
                                    <div className="text-sm">
                                        <span className="text-gray-500">Zone:</span>
                                        <span className="text-white ml-2">{officer.zone}</span>
                                    </div>
                                )}
                                {officer.email && (
                                    <div className="text-sm">
                                        <span className="text-gray-500">Email:</span>
                                        <span className="text-white ml-2 text-xs">{officer.email}</span>
                                    </div>
                                )}
                                {officer.phone && (
                                    <div className="text-sm">
                                        <span className="text-gray-500">Phone:</span>
                                        <span className="text-white ml-2">{officer.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                <div className={`text-sm font-medium ${getStatusColor(officer.status)}`}>
                                    ● {officer.status}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedOfficer(officer);
                                            setPerformanceModalOpen(true);
                                        }}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                        title="View Performance"
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setFormData({
                                                employee_id: officer.employee_id,
                                                name: officer.name,
                                                designation: officer.designation,
                                                department_id: officer.department_id.toString(),
                                                ward: officer.ward,
                                                zone: officer.zone || '',
                                                circle: officer.circle || '',
                                                email: officer.email || '',
                                                phone: officer.phone || '',
                                                status: officer.status
                                            });
                                            setEditOfficerId(officer.id);
                                            setIsEditMode(true);
                                            setIsCreateModalOpen(true);
                                        }}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Officer Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Officer' : 'Create New Officer'}</h2>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveOfficer} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Employee ID *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="PWD-JE-1042"
                                        value={formData.employee_id}
                                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ramesh Kumar"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Designation *
                                    </label>
                                    <select
                                        required
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="JE">Junior Engineer (JE)</option>
                                        <option value="AE">Assistant Engineer (AE)</option>
                                        <option value="EE">Executive Engineer (EE)</option>
                                        <option value="SE">Superintending Engineer (SE)</option>
                                        <option value="Inspector">Inspector</option>
                                        <option value="Supervisor">Supervisor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Department *
                                    </label>
                                    <select
                                        required
                                        value={formData.department_id}
                                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Ward *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ward 12"
                                        value={formData.ward}
                                        onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Zone
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Zone A"
                                        value={formData.zone}
                                        onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Circle
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Circle 1"
                                        value={formData.circle}
                                        onChange={(e) => setFormData({ ...formData, circle: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="officer@pwd.gov.in"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        resetForm();
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                >
                                    {isEditMode ? 'Update Officer' : 'Create Officer'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Officer Performance Modal */}
            {selectedOfficer && (
                <OfficerPerformanceModal
                    isOpen={performanceModalOpen}
                    onClose={() => {
                        setPerformanceModalOpen(false);
                        setSelectedOfficer(null);
                    }}
                    officerId={selectedOfficer.id}
                    officerName={selectedOfficer.name}
                    designation={selectedOfficer.designation}
                />
            )}
        </div>
    );
}
