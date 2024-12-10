'use client';

import { JobData } from '@/app/jobs/page';

interface ModalProps {
  job: JobData;
  onClose: () => void;
}

export const JobDetailsModal = ({ job, onClose }: ModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Company</h3>
            <p className="text-gray-600">
              {typeof job.company === 'string' ? job.company : job.company?.name || 'No Company'}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Location</h3>
            <p className="text-gray-600">
              {typeof job.location === 'string' ? job.location : job.location?.name || 'No Location'}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Posted Date</h3>
            <p className="text-gray-600">{job.datePosted}</p>
          </div>
          
          <div className="flex justify-end pt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
