'use client';

import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { JobDetailsModal } from '@/components/JobDetailsModal';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface JobData {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  datePosted: string;
}

interface CompanyDetails {
  id: number;
  name: string;
  universalName: string;
  description: string;
  logo: string;
  url: string;
  followerCount: number;
  staffCount: number;
  staffCountRange: {
    start: number;
    end: number;
  };
  specialities: string[];
  industries: string[];
  headquarter: {
    geographicArea: string;
    country: string;
    city: string;
    postalCode: string;
    line2: string;
    line1: string;
  };
}

interface ApplyMethod {
  companyApplyUrl?: string;
  easyApplyUrl?: string;
}

export interface JobDetails {
  id: string;
  state: string;
  title: string;
  description: string;
  url: string;
  applyMethod?: ApplyMethod;
  company?: CompanyDetails;
  contentLanguage?: {
    code: string;
    name: string;
  };
  location: string;
  type: string;
  applies: number;
  views: number;
  workRemoteAllowed: boolean;
  workPlace: string;
  expireAt: number;
  formattedJobFunctions?: string[];
  jobFunctions?: string[];
  industries?: number[];
  formattedIndustries?: string[];
  formattedExperienceLevel?: string;
  listedAt: number;
  listedAtDate: string;
  originalListedAt: number;
  originalListedDate: string;
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

interface JobSearchParams {
  keywords: string;
  locationId: string;
  datePosted: string;
  sort: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('Fullstack developer');

  // Selected job basics
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  // Detailed job info
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // State for indexing modal
  const [openIndexModal, setOpenIndexModal] = useState(false);
  const [tempSearchParams, setTempSearchParams] = useState<JobSearchParams>({
    keywords: 'Fullstack developer',
    locationId: 'Munich',
    datePosted: 'past24Hours',
    sort: 'mostRecent'
  });

  const [tempLocationName, setTempLocationName] = useState('Berlin, Germany');
  const [tempKeywords, setTempKeywords] = useState('Fullstack developer');
  const [tempDatePosted, setTempDatePosted] = useState('past24Hours');
  const [tempSort, setTempSort] = useState('mostRecent');

  const [currentSearchParams, setCurrentSearchParams] = useState<JobSearchParams>({
    keywords: 'Fullstack developer',
    locationId: 'Munich',
    datePosted: 'past24Hours',
    sort: 'mostRecent'
  });

  // Debounced function for searching jobs in the vector DB
  const debouncedSearchJobs = useCallback(
    debounce(async (term: string) => {
      setLoading(true);
      try {
        // Convert search term to embedding
        const embeddingResponse = await fetch('http://localhost:5500/api/query-embed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query_text: term || "software engineer"
          })
        });
        const embeddingData = await embeddingResponse.json();

        // Use the embedding to search jobs in the vector DB
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
          jobId:job.payload?.jobId || '',
          title: job.payload?.title || '',
          company: job.payload?.company || '',
          location: job.payload?.location || '',
          description: job.payload?.description || '',
          datePosted: job.payload?.datePosted || ''
        })) : [];

        setJobs(transformedJobs);
      } catch (error) {
        console.error('Error searching jobs:', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  // Initial load and whenever searchTerm changes
  useEffect(() => {
    debouncedSearchJobs(searchTerm);
    return () => {
      debouncedSearchJobs.cancel();
    };
  }, [searchTerm, debouncedSearchJobs]);

  const indexLatestJobs = async (params: JobSearchParams) => {
    setLoading(true);
  
    try {
      // This call fetches and indexes the latest jobs
      const response1 = await fetch('http://localhost:3001/fetch-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
  
      // Check if the response is successful
      if (!response1.ok) {
        throw new Error(`HTTP error! Status: ${response1.status}`);
      }
  
      // Attempt to parse the response only if it's not empty
      const text = await response1.text();
      const data = text ? JSON.parse(text) : null;
  
      // After indexing, trigger a fresh search
      debouncedSearchJobs(searchTerm);
    } catch (error) {
      console.error('Error indexing jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocationId = async (locationName: string) => {
    const response = await fetch('http://localhost:3001/getLocationId', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationName })
    });
  
    const data = await response.json();
    console.log('Location ID:', data);
  
    // Extract the numeric part from the location ID
    const locationId = data.replace('urn:li:geo:', '');
    console.log('Extracted Location ID:', locationId);
  
    return locationId;
  };

  const handleIndexJobs = async () => {
    setOpenIndexModal(false);
    const locationId = await getLocationId(tempLocationName);
    if (!locationId) {
      alert('Failed to find a valid location ID for the given location. Please try a different location.');
      return;
    }

    const newParams: JobSearchParams = {
      keywords: tempKeywords,
      locationId: locationId,
      datePosted: tempDatePosted,
      sort: tempSort,
    };

    setCurrentSearchParams(newParams);
    await indexLatestJobs(newParams);
  };


  const handleViewDetails = async (job: JobData) => {
    setSelectedJob(job);
    console.log('Viewing details for job:', job);
    setDetailsLoading(true);
    const companyId = job.jobId;
    try {
      const response = await fetch('http://localhost:3001/getJobDetails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: companyId })
      });
      const data = await response.json();
      if (data && data.success && data.data) {
        setSelectedJobDetails(data.data);
      } else {
        setSelectedJobDetails(null);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      setSelectedJobDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

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

          {/* Dialog Trigger for Indexing */}
          <Dialog open={openIndexModal} onOpenChange={setOpenIndexModal}>
            <DialogTrigger asChild>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
              >
                Index Latest Jobs
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Index Latest Jobs</DialogTitle>
                <DialogDescription>
                  Adjust the parameters for indexing jobs.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Keywords</label>
                  <input
                    type="text"
                    className="mt-1 p-2 border rounded w-full"
                    value={tempKeywords}
                    onChange={(e) => setTempKeywords(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location Name</label>
                  <input
                    type="text"
                    className="mt-1 p-2 border rounded w-full"
                    value={tempLocationName}
                    onChange={(e) => setTempLocationName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Posted</label>
                  <select
                    className="mt-1 p-2 border rounded w-full"
                    value={tempDatePosted}
                    onChange={(e) => setTempDatePosted(e.target.value)}
                  >
                    <option value="past24Hours">Past 24 Hours</option>
                    <option value="pastWeek">Past Week</option>
                    <option value="pastMonth">Past Month</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sort</label>
                  <select
                    className="mt-1 p-2 border rounded w-full"
                    value={tempSort}
                    onChange={(e) => setTempSort(e.target.value)}
                  >
                    <option value="mostRecent">Most Recent</option>
                    <option value="relevance">Relevance</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenIndexModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleIndexJobs}
                >
                  Index Latest Jobs
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Posted {typeof job.datePosted === 'string' ? job.datePosted : 'Recently'}
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => handleViewDetails(job)}
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
                jobDetails={selectedJobDetails}
                onClose={() => {
                  setSelectedJob(null);
                  setSelectedJobDetails(null);
                }}
                loading={detailsLoading}
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
