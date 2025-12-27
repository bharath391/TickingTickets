'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Show {
  show_id: string;
  movie_title: string;
  movie_genre: string;
  movie_desc: string;
  movie_price: number;
  theatre_name: string;
  theatre_location: string;
  show_time: string;
  seat_count: number;
  show_type: string;
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Load initial shows? Or wait for search? 
  // Let's load some initial shows if logged in.
  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async (searchQuery?: string) => {
    setLoading(true);
    setError('');
    try {
      const params = searchQuery ? { title: searchQuery } : {};
      const res = await api.get('/usersearch', { params });
      setShows(res.data.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Not logged in
        // router.push('/login'); // Optional: auto redirect
        setError('Please login to search shows');
      } else {
        setError('Failed to fetch shows');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchShows(query);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar Placeholder */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-500">TickingTickets</h1>
          <div className="space-x-4">
             {/* If not logged in, show these. Logic needed to check auth state but for simplicity: */}
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Login</Link>
            <Link href="/signup" className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full transition-colors">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-gray-950 pointer-events-none" />
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Find Your Next <span className="text-indigo-500">Cinema Experience</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          Book tickets for the latest movies at your favorite theatres. Simple, fast, and secure.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto relative z-10">
          <div className="relative">
            <input
              type="text"
              className="w-full bg-gray-900 border border-gray-700 rounded-full py-4 px-6 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-lg"
              placeholder="Search by movie title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 p-2 rounded-full hover:bg-indigo-500 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
      </section>

      {/* Results Section */}
      <section className="container mx-auto px-4 py-10">
        {error && (
            <div className="text-center py-10">
                <p className="text-red-400 mb-4">{error}</p>
                {error.includes('login') && (
                    <Link href="/login" className="text-indigo-400 hover:underline">Go to Login</Link>
                )}
            </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Searching for shows...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.map((show) => (
              <div key={show.show_id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-indigo-500/10 hover:shadow-lg group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{show.movie_title}</h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{show.movie_genre}</p>
                    </div>
                    <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-700">{show.show_type}</span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2">{show.movie_desc}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-300 border-t border-gray-800 pt-4">
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>{show.theatre_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                         <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{new Date(show.show_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-6 bg-gray-800 hover:bg-indigo-600 text-white py-3 rounded-lg font-medium transition-all duration-200">
                    Book Now for ${show.movie_price}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && shows.length === 0 && !error && (
            <div className="text-center text-gray-500 py-10">
                <p>No shows found. Try searching for something else!</p>
            </div>
        )}
      </section>
    </div>
  );
}