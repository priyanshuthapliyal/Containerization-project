import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import {
  Building2,
  Globe,
  Plus,
  Edit2,
  Mail,
  Phone,
  User,
  Loader2,
  X
} from 'lucide-react';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch companies error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const openCreateModal = () => {
    setSelectedCompany(null);
    setName('');
    setWebsite('');
    setDescription('');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setSubmitError('');
    setModalOpen(true);
  };

  const openEditModal = (company) => {
    setSelectedCompany(company);
    setName(company.name);
    setWebsite(company.website || '');
    setDescription(company.description || '');
    setContactName(company.contactPerson?.name || '');
    setContactEmail(company.contactPerson?.email || '');
    setContactPhone(company.contactPerson?.phone || '');
    setSubmitError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setSubmitError('Company name is required');
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');

    const payload = {
      name,
      website,
      description,
      contactPerson: {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
      },
    };

    try {
      if (selectedCompany) {
        await api.put(`/companies/${selectedCompany._id}`, payload);
      } else {
        await api.post('/companies', payload);
      }
      fetchCompanies();
      setModalOpen(false);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Partner Companies</h1>
          <p className="text-slate-500">Manage corporate recruitment accounts and contact listings</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm shadow-md shadow-sky-500/10 hover:shadow-sky-500/25 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </button>
      </div>

      {companies.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Companies Listed</h3>
          <p className="text-slate-400 text-sm mt-1">Register corporate accounts to post job opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map((company) => (
            <div
              key={company._id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-slate-400 flex-shrink-0">
                      <Building2 className="w-5 h-5 mx-auto" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{company.name}</h3>
                      {company.website && (
                        <a
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-sky-500 hover:underline flex items-center font-medium"
                        >
                          <Globe className="w-3 h-3 mr-1" />
                          {company.website}
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal(company)}
                    className="p-1.5 text-slate-400 hover:text-sky-500 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {company.description && (
                  <p className="text-xs text-slate-500 line-clamp-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    {company.description}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4 mt-auto space-y-2 text-xs font-semibold text-slate-500">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Primary Corporate Contact
                </span>
                {company.contactPerson?.name && (
                  <div className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span>{company.contactPerson.name}</span>
                  </div>
                )}
                {company.contactPerson?.email && (
                  <div className="flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span>{company.contactPerson.email}</span>
                  </div>
                )}
                {company.contactPerson?.phone && (
                  <div className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span>{company.contactPerson.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-8 animate-zoom-in relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold text-slate-800 mb-6">
              {selectedCompany ? 'Modify Recruiter Profile' : 'Register Corporate Recruiter'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Website URL
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. acme.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Profile Description
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Acme Corp is a globally recognized manufacturing provider..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 mt-6">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Primary Contact Person
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Name"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-xs"
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-xs"
                  />
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-xs"
                  />
                </div>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
                  {submitError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm transition-colors flex items-center disabled:opacity-50"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Recruiter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
