'use client';

import { JobDetails } from '@/app/jobs/page';

interface ModalProps {
  jobDetails: JobDetails | null;
  onClose: () => void;
  loading: boolean;
}

export const JobDetailsModal = ({ jobDetails, onClose, loading }: ModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{jobDetails?.title || 'Job Details'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {jobDetails ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Company</h3>
                  <p className="text-gray-600">{jobDetails.company?.name || 'No Company'}</p>
                  <p className="text-gray-500 text-sm">{jobDetails.company?.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                  <p className="text-gray-600">{jobDetails.location || 'No Location'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{jobDetails.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">URL</h3>
                  <a href={jobDetails.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {jobDetails.url}
                  </a>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Apply Method</h3>
                  <p className="text-gray-600">Company Apply URL: {jobDetails.applyMethod?.companyApplyUrl || 'N/A'}</p>
                  <p className="text-gray-600">Easy Apply URL: {jobDetails.applyMethod?.easyApplyUrl || 'N/A'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Industries</h3>
                  <p className="text-gray-600">
                    {jobDetails.formattedIndustries && jobDetails.formattedIndustries.length > 0
                      ? jobDetails.formattedIndustries.join(', ')
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Experience Level</h3>
                  <p className="text-gray-600">{jobDetails.formattedExperienceLevel || 'N/A'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Job Functions</h3>
                  <p className="text-gray-600">
                    {jobDetails.formattedJobFunctions && jobDetails.formattedJobFunctions.length > 0
                      ? jobDetails.formattedJobFunctions.join(', ')
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Listed Date</h3>
                  <p className="text-gray-600">{jobDetails.listedAtDate || 'N/A'}</p>
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <div>No details available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
