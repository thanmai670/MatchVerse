'use client';

import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { JobDetailsModal } from '@/components/JobDetailsModal';
export interface JobData {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    datePosted: string;
}

export interface ResumeData {
    id: string;
    personal_information: {
        name: string;
        email: string;
        phone: string;
        github: string;
        linkedin: string;
    };
    skills: string[];
    education: string[];
    work_experience: string[];
    projects: string[];
    certifications: string[];
    unstructured_text_blocks: string[];
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<JobData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilters, setSelectedFilters] = useState({
        location: '',
        company: '',
        datePosted: ''
    });
    const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
    const debouncedFetchJobs = useCallback(
        debounce(async (term: string) => {
            setLoading(true);
            try {
                // First get the embedding for the search query
                const embeddingResponse = await fetch('http://localhost:5500/api/query-embed', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query_text: term || "software engineer" // Default search if no term
                    })
                });
                const embeddingData = await embeddingResponse.json();

                // Then use the embedding to search jobs
                const response = await fetch('http://localhost:5200/job/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query_embedding: embeddingData.embedding,
                        section: 'title',
                        top_k: 10
                    })
                });
                const data = await response.json();
                const transformedJobs = Array.isArray(data.results) ? data.results.map((job: any) => ({
                    id: job.id || '',
                    title: job.payload?.title || '',
                    company: job.payload?.company || '',
                    location: job.payload?.location || '',
                    description: job.payload?.description || '',
                    datePosted: job.payload?.datePosted || ''
                })) : [];

                setJobs(transformedJobs);
            } catch (error) {
                console.error('Error fetching jobs:', error);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        }, 500), // 500ms delay
        []
    );

    useEffect(() => {
        debouncedFetchJobs(searchTerm);
        return () => {
            debouncedFetchJobs.cancel();
        };
    }, [searchTerm, debouncedFetchJobs]);

    const filteredJobs = jobs?.filter(job => {
        const companyName = typeof job.company === 'string' ? job.company : job.company?.name || '';
        const jobTitle = typeof job.title === 'string' ? job.title : '';

        return jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            companyName.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Available Positions</h1>
                    <p className="mt-2 text-sm text-gray-600">Discover your next career opportunity</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-4 mb-8">
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="p-3 border rounded-lg shadow-sm"
                        value={selectedFilters.location}
                        onChange={(e) => setSelectedFilters({ ...selectedFilters, location: e.target.value })}
                    >
                        <option value="">All Locations</option>
                        <option value="remote">Remote</option>
                        <option value="onsite">On-site</option>
                        <option value="hybrid">Hybrid</option>
                    </select>
                </div>

                {/* Jobs Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map((job) => (
                            <div key={job.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold text-gray-900 truncate">
                                            {typeof job.title === 'string' ? job.title : 'No Title'}
                                        </h2>
                                        <span className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded-full">
                                            New
                                        </span>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-gray-600">
                                            {typeof job.company === 'string' ? job.company : job.company?.name || 'No Company'}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {typeof job.location === 'string' ? job.location : job.location?.name || 'No Location'}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Posted {typeof job.datePosted === 'string' ? job.datePosted : 'Recently'}
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => setSelectedJob(job)}
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {selectedJob && (
                            <JobDetailsModal
                                job={selectedJob}
                                onClose={() => setSelectedJob(null)}
                            />
                        )}
                    </div>
                )}

                {/* No Results */}
                {!loading && filteredJobs.length === 0 && (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
                        <p className="mt-2 text-gray-500">Try adjusting your search criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
}
