import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { API_BASE } from '../../config/api';
//MunicipalDashboard
function MunicipalDashboard() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [reportedPotholes, setReportedPotholes] = useState([]);
  const [assignedPotholes, setAssignedPotholes] = useState([]);
  const [completedPotholes, setCompletedPotholes] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [completionModal, setCompletionModal] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionImage, setCompletionImage] = useState(null);
  const [loading, setLoading] = useState(false);
  

  // Fetch reported potholes
  useEffect(() => {
    const fetchReported = async () => {
      try {
        const res = await fetch(`${API_BASE}/report/reported`);
        const data = await res.json();
        if (data.success) {
          setReportedPotholes(data.potholes);
        }
      } catch (err) {
        // Silent fail
      }
    };
    fetchReported();
  }, []);

  // Fetch assigned potholes
 // Fetch assigned potholes
useEffect(() => {
  if (!user?.id) return;  // ✅ guard
  const fetchAssigned = async () => {
    try {
      const res = await fetch(`${API_BASE}/report/assigned/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setAssignedPotholes(data.potholes);
      }
    } catch (err) {
      // Silent fail
    }
  };
  fetchAssigned();
}, [user?.id]);

// Fetch completed potholes
useEffect(() => {
  if (!user?.id) return;  // ✅ guard
  const fetchCompleted = async () => {
    try {
      const res = await fetch(`${API_BASE}/report/completed/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setCompletedPotholes(data.potholes);
      }
    } catch (err) {
      // Silent fail
    }
  };
  fetchCompleted();
}, [user?.id]);


  // Assign pothole to logged-in user
  const assignPothole = async (potholeId) => {
    try {
      const res = await fetch(`${API_BASE}/report/pothole/assign/${potholeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignedTo: user._id }),
      });
      const data = await res.json();
      if (data.success) {
        // Move pothole from reported to assigned
        const pothole = reportedPotholes.find(p => p._id === potholeId);
        setReportedPotholes(prev => prev.filter(p => p._id !== potholeId));
        setAssignedPotholes(prev => [...prev, data.pothole]);
        alert('Pothole assigned successfully!');
      }
    } catch (err) {
      alert('Failed to assign pothole');
    }
  };

  // Mark pothole as completed
  const completePothole = async () => {
    if (!completionModal) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('completionNotes', completionNotes);
      if (completionImage) {
        formData.append('completionImage', completionImage);
      }

      const res = await fetch(`${API_BASE}/report/pothole/complete/${completionModal}`, {
        method: 'PUT',
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        // Move pothole from assigned to completed
        const pothole = assignedPotholes.find(p => p._id === completionModal);
        setAssignedPotholes(prev => prev.filter(p => p._id !== completionModal));
        setCompletedPotholes(prev => [...prev, data.pothole]);
        setCompletionModal(null);
        setCompletionNotes('');
        setCompletionImage(null);
        alert('Pothole marked as completed!');
      }
    } catch (err) {
      alert('Failed to complete pothole');
    } finally {
      setLoading(false);
    }
  };

  // Calculate duration
  const getDuration = (startDate, endDate = null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Municipality Dashboard
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
            Manage pothole reports in your area
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${theme === 'dark' ? 'bg-red-900/20 border-red-700/50' : 'bg-white border-gray-200'} border rounded-xl shadow-lg p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-gray-600'} font-medium mb-1`}>
                  Reported
                </div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {reportedPotholes.length}
                </div>
              </div>
              <svg className={`w-10 h-10 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-white border-gray-200'} border rounded-xl shadow-lg p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm ${theme === 'dark' ? 'text-yellow-400' : 'text-gray-600'} font-medium mb-1`}>
                  In Progress
                </div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {assignedPotholes.length}
                </div>
              </div>
              <svg className={`w-10 h-10 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-green-900/20 border-green-700/50' : 'bg-white border-gray-200'} border rounded-xl shadow-lg p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-gray-600'} font-medium mb-1`}>
                  Completed
                </div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {completedPotholes.length}
                </div>
              </div>
              <svg className={`w-10 h-10 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-blue-900/20 border-blue-700/50' : 'bg-white border-gray-200'} border rounded-xl shadow-lg p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-gray-600'} font-medium mb-1`}>
                  Avg Days
                </div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {assignedPotholes.length > 0 ? 
                    Math.round(assignedPotholes.reduce((acc, p) => acc + getDuration(p.assignedDate), 0) / assignedPotholes.length) 
                    : 0}
                </div>
              </div>
              <svg className={`w-10 h-10 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Reported Potholes */}
        <div className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-lg border rounded-xl shadow-lg p-6 mb-8`}>
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
            Reported Potholes
          </h2>
          
          {reportedPotholes.length === 0 ? (
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No reported potholes in your area
            </p>
          ) : (
            <div className="space-y-4">
              {reportedPotholes.map((pothole) => (
                <div key={pothole._id} className={`${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {pothole.location}
                      </h3>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm mb-2`}>
                        Reported by: {pothole.submittedBy?.name} • {new Date(pothole.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-4 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pothole.severity === 'high' ? 'bg-red-100 text-red-800' :
                          pothole.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {pothole.severity.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          Duration: {getDuration(pothole.createdAt)} days
                        </span>
                      </div>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {pothole.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedImage(pothole.image)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                      >
                        View Image
                      </button>
                      <button
                        onClick={() => assignPothole(pothole._id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                      >
                        Assign to Me
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Potholes */}
        <div className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-lg border rounded-xl shadow-lg p-6 mb-8`}>
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
            My Assigned Potholes
          </h2>
          
          {assignedPotholes.length === 0 ? (
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No assigned potholes
            </p>
          ) : (
            <div className="space-y-4">
              {assignedPotholes.map((pothole) => (
                <div key={pothole._id} className={`${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {pothole.location}
                      </h3>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm mb-2`}>
                        Reported by: {pothole.submittedBy?.name} • Assigned: {new Date(pothole.assignedDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-4 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pothole.severity === 'high' ? 'bg-red-100 text-red-800' :
                          pothole.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {pothole.severity.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          Duration: {getDuration(pothole.assignedDate)} days
                        </span>
                      </div>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {pothole.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedImage(pothole.image)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                      >
                        View Image
                      </button>
                      <button
                        onClick={() => setCompletionModal(pothole._id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                      >
                        Mark Complete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Potholes */}
        <div className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-lg border rounded-xl shadow-lg p-6`}>
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
            Completed Potholes
          </h2>
          
          {completedPotholes.length === 0 ? (
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No completed potholes yet
            </p>
          ) : (
            <div className="space-y-4">
              {completedPotholes.map((pothole) => (
                <div key={pothole._id} className={`${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {pothole.location}
                      </h3>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm mb-2`}>
                        Completed: {new Date(pothole.dateOfCompletion).toLocaleDateString()} • Duration: {getDuration(pothole.assignedDate, pothole.dateOfCompletion)} days
                      </p>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {pothole.completionNotes || 'No completion notes'}
                      </p>
                    </div>
                    <div>
                      {pothole.completionImage && (
                        <button
                          onClick={() => setSelectedImage(pothole.completionImage)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                        >
                          View Completion
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-colors duration-200"
              >
                ✕
              </button>
              <img
             src={selectedImage?.startsWith("data:") 
                 ? selectedImage 
                 : `${API_BASE}/uploads/${selectedImage}`}
                 alt="Pothole"
               className="max-w-full max-h-[90vh] object-contain rounded-xl"
                onError={(e) => {
                   e.currentTarget.onerror = null; // prevents infinite loop
                  e.currentTarget.src = "/placeholder-image.png"; 
                   }}
                />


            </div>
          </div>
        )}

        {/* Completion Modal */}
        {completionModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Mark Pothole as Completed</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Notes
                  </label>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the work completed..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCompletionImage(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setCompletionModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={completePothole}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Completing...' : 'Mark Complete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MunicipalDashboard;
