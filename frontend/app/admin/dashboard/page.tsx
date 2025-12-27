'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreateTheatre = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/admin/theatres', { name, location });
      setMessage('Theatre created successfully!');
      setName('');
      setLocation('');
    } catch (err: any) {
        if (err.response?.status === 401) {
             router.push('/login'); // Redirect to login if unauthorized
        }
      setError(err.response?.data?.message || 'Failed to create theatre');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white">
      <h1 className="text-3xl font-bold mb-8 text-indigo-500">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Theatre Card */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Add New Theatre</h2>
          <form onSubmit={handleCreateTheatre} className="space-y-4">
             {message && <p className="text-green-400 text-sm">{message}</p>}
             {error && <p className="text-red-400 text-sm">{error}</p>}
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded font-medium transition-colors"
            >
              Create Theatre
            </button>
          </form>
        </div>

        {/* Placeholder for other admin actions */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex items-center justify-center text-gray-500">
            <p>More admin controls coming soon...</p>
        </div>
      </div>
    </div>
  );
}
