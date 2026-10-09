import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import exifr from 'exifr';
import { useNavigate } from 'react-router-dom';

const ReportPothole = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: '',
    description: '',
    severity: 'medium',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [gpsData, setGpsData] = useState(null);

  // Helper function to convert file to base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const hasValidGpsCoordinates = ({ latitude, longitude } = {}) => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    return Number.isFinite(lat) && Number.isFinite(lng) &&
      lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  // Extract GPS coordinates from image EXIF data or GPS overlay text
  const extractGpsData = async (file) => {
    try {
      // exifr.gps is purpose-built for GPS EXIF and works more reliably than
      // a filtered general parse for photos from phone cameras.
      const exifData = await exifr.gps(file);
      
      if (hasValidGpsCoordinates(exifData)) {
        const gps = {
          latitude: Number(exifData.latitude),
          longitude: Number(exifData.longitude),
          source: 'EXIF'
        };
        setGpsData(gps);
        
        // Auto-populate location field with coordinates
        setFormData(prev => ({
          ...prev,
          location: `${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}`
        }));
        
        return gps;
      } else {
        // Fallback: Try to extract GPS from overlay text using backend OCR
        const base64 = await toBase64(file);
        const ocrResponse = await fetch(`${API_BASE}/report/extract-gps-ocr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        
        const ocrData = await ocrResponse.json();
        
        if (ocrData.success && hasValidGpsCoordinates(ocrData)) {
          const gps = {
            latitude: Number(ocrData.latitude),
            longitude: Number(ocrData.longitude),
            source: 'OCR'
          };
          setGpsData(gps);
          
          // Auto-populate location field with coordinates
          setFormData(prev => ({
            ...prev,
            location: `${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}`
          }));
          
          return gps;
        } else {
          setGpsData(null);
          setValidationError("This image does not contain GPS location data. Please take a photo with location services enabled or ensure GPS coordinates are visible in the image.");
          return null;
        }
      }
    } catch (error) {
      console.error('Error extracting GPS data:', error);
      setGpsData(null);
      setValidationError("Could not read GPS data from image. Please ensure the image contains location information.");
      return null;
    }
  };

  // Validate image with Roboflow detection via Node.js API
  const validateImage = async (base64Image) => {
    setIsValidating(true);
    setValidationError(null);
    setDetectionResult(null);

    try {
      const response = await fetch(`${API_BASE}/report/detect-pothole`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await response.json();
      
      // Check if AI rejected the image
      if (!data.success || !data.isValidPothole) {
        setValidationError(data.message || "This image does not appear to contain a pothole. Please upload a clear pothole image.");
        setDetectionResult(null);
        return false;
      }
      
      setDetectionResult(data);
      
      // Auto-suggest severity based on detection if available
      if (data.suggestedSeverity) {
        setFormData(prev => ({
          ...prev,
          severity: data.suggestedSeverity
        }));
      }
      
      return true;
    } catch (err) {
      console.error('Validation error:', err);
      setValidationError('Failed to validate image. Please try again or contact support.');
      setDetectionResult(null);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const useCurrentDeviceLocation = () => {
    if (!formData.image) {
      setValidationError('Choose a photo before using your current location.');
      return;
    }

    if (!navigator.geolocation) {
      setValidationError('This browser does not support location services.');
      return;
    }

    if (!window.isSecureContext) {
      setValidationError('Device location requires HTTPS. Open the app at https://… on your phone, or use http://localhost:5173 when testing on this computer.');
      return;
    }

    setIsLocating(true);
    setValidationError(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const gps = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          source: 'Device location'
        };

        setGpsData(gps);
        setFormData(prev => ({
          ...prev,
          location: `${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}`
        }));
        setIsLocating(false);

        // Continue with normal pothole validation after the user explicitly
        // supplies their current location.
        const base64 = await toBase64(formData.image);
        await validateImage(base64);
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied. Allow location access in your browser and try again.'
          : 'Unable to get your current location. Please try again outside or enable Location Services.';
        setValidationError(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if image is validated and has GPS data
    if (!detectionResult) {
      alert('Please upload and validate a pothole image first.');
      return;
    }
    
    if (!gpsData) {
      alert('Image must contain GPS location data. Please take a photo with location services enabled.');
      return;
    }

    setIsSubmitting(true);

    try {
      let base64Image = "";
      if (formData.image) {
        base64Image = await toBase64(formData.image);
      }

      const response = await fetch(`${API_BASE}/report/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submittedBy: user.id,
          location: formData.location,
          description: formData.description,
          severity: formData.severity,
          image: base64Image,
          latitude: gpsData.latitude,
          longitude: gpsData.longitude
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Build success message
        let message = 'Pothole reported successfully! Redirecting to map view...';
        if (data.detection && data.detection.confidence > 0) {
          message += `\nAI Confidence: ${(data.detection.confidence * 100).toFixed(1)}%`;
          if (data.detection.width && data.detection.height) {
            message += `\nDimensions: ${data.detection.width}px × ${data.detection.height}px`;
          }
        }
        alert(message);
        
        // Redirect to map view with the new pothole location
        navigate('/map', {
          state: {
            newPothole: {
              latitude: gpsData.latitude,
              longitude: gpsData.longitude,
              id: data.pothole?._id
            }
          }
        });
      } else {
        // Check if it's a duplicate error
        if (data.error === 'Duplicate report') {
          setValidationError(`⚠️ This location already has a reported pothole (Status: ${data.existingReport?.status}). Please check the map view before reporting.`);
        } else {
          alert(data.message || 'Upload failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && files[0]) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // STEP 1: Extract GPS data (REQUIRED)
      const gps = await extractGpsData(file);
      
      // Only proceed with validation if GPS data exists
      if (gps) {
        // STEP 2: Validate image with AI (currently disabled)
        const base64 = await toBase64(file);
        await validateImage(base64);
      } else {
        // Clear any previous detection result if no GPS
        setDetectionResult(null);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Card */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 md:p-8 border border-slate-700">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-900/30 border border-green-700/50">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-green-300 text-sm font-medium">AI Detection Active</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Location Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Main Street & 5th Ave, near City Hall"
              />
            </div>

            {/* Severity Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Severity Level *
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="low" className="bg-slate-700">Low - Minor inconvenience</option>
                <option value="medium" className="bg-slate-700">Medium - Noticeable damage</option>
                <option value="high" className="bg-slate-700">High - Safety hazard</option>
              </select>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe the pothole size, depth, location markers, and any safety concerns..."
              />
            </div>

            {/* Photo Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Photo *
              </label>
              
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center bg-slate-700/50 hover:border-slate-500 transition-colors">
                <label htmlFor="image-upload" className="cursor-pointer block">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById('image-upload').click()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      disabled={isValidating}
                    >
                      {isValidating ? 'Validating...' : 'Choose Geotagged Photo'}
                    </button>
                    {formData.image && (
                      <span className="text-gray-300 text-sm bg-slate-600 px-3 py-1 rounded-md">
                        {formData.image.name}
                      </span>
                    )}
                  </div>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  name="image"
                  accept="image/*"
                  capture="environment"
                  onChange={handleChange}
                  className="hidden"
                  disabled={isValidating}
                />
                <p className="text-sm text-gray-400 mt-3">
                  GPS is read from the original photo. If its metadata is unavailable, use your current device location below.
                </p>
                {formData.image && !gpsData && (
                  <button
                    type="button"
                    onClick={useCurrentDeviceLocation}
                    disabled={isLocating || isValidating}
                    className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLocating ? 'Getting your location...' : 'Use my current device location'}
                  </button>
                )}
              </div>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full max-w-md mx-auto rounded-lg border border-slate-600"
                  />
                </div>
              )}
              
              {/* GPS Data Display */}
              {gpsData && (
                <div className="mt-3 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                  <p className="text-sm text-green-400 font-medium mb-1">
                    GPS Location Detected {gpsData.source === 'OCR' && '(from image overlay)'}
                  </p>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div>Latitude: <span className="font-mono">{gpsData.latitude.toFixed(6)}</span></div>
                    <div>Longitude: <span className="font-mono">{gpsData.longitude.toFixed(6)}</span></div>
                    {gpsData.source === 'EXIF' && <div className="text-green-400 mt-1">From EXIF metadata</div>}
                    {gpsData.source === 'OCR' && <div className="text-yellow-400 mt-1">Extracted from GPS overlay text</div>}
                  </div>
                </div>
              )}
              
              {/* Validation Loading */}
              {isValidating && (
                <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                  <p className="text-sm text-blue-400">
                    Validating image with AI detection...
                  </p>
                </div>
              )}
              
              {/* Validation Error */}
              {validationError && (
                <div className="mt-3 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                  <p className="text-sm text-red-400 font-medium">
                    {validationError}
                  </p>
                  
                  {validationError.includes('GPS location data') && (
                    <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                      <p className="font-medium text-yellow-400 mb-2 text-sm">
                        How to add location data:
                      </p>
                      <ol className="ml-4 list-decimal space-y-1 text-xs text-gray-300">
                        <li>Enable Location Services in your phone settings</li>
                        <li>Open your Camera app and allow location access</li>
                        <li>Take a photo of the pothole</li>
                        <li>OR use a camera app that adds GPS overlay text to the image</li>
                      </ol>
                      <button
                        type="button"
                        onClick={useCurrentDeviceLocation}
                        disabled={isLocating || isValidating}
                        className="mt-3 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isLocating ? 'Getting your location...' : 'Use my current device location'}
                      </button>
                      <p className="mt-2 text-xs text-gray-400">
                        Use this only when you are at the pothole location.
                      </p>
                    </div>
                  )}
                  
                  {validationError.includes('pothole') && !validationError.includes('GPS') && (
                    <p className="text-xs text-red-600 mt-1">Our AI detected this is not a pothole image. Please upload a clear photo showing road damage/pothole.</p>
                  )}
                </div>
              )}
              
              {/* Detection Success */}
              {detectionResult && detectionResult.isValidPothole && gpsData && (
                <div className="mt-3 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                  <p className="text-sm text-green-400 font-medium mb-2">
                    Image Validated - Ready to Submit!
                  </p>
                  {detectionResult.detectionConfidence > 0 ? (
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                      <div className="bg-slate-700 px-3 py-2 rounded">
                        <span className="block text-gray-400">AI Confidence:</span> 
                        <span className="text-base font-semibold text-white">{detectionResult.confidencePercent || Math.round(detectionResult.detectionConfidence * 100)}%</span>
                      </div>
                      <div className="bg-slate-700 px-3 py-2 rounded">
                        <span className="block text-gray-400">Detections:</span> 
                        <span className="text-base font-semibold text-white">{detectionResult.totalDetections}</span>
                      </div>
                      <div className="bg-slate-700 px-3 py-2 rounded">
                        <span className="block text-gray-400">Width:</span> 
                        <span className="text-base font-semibold text-white">{detectionResult.width}px</span>
                      </div>
                      <div className="bg-slate-700 px-3 py-2 rounded">
                        <span className="block text-gray-400">Height:</span> 
                        <span className="text-base font-semibold text-white">{detectionResult.height}px</span>
                      </div>
                      {detectionResult.suggestedSeverity && (
                        <div className="col-span-2 bg-slate-700 px-3 py-2 rounded">
                          <span className="text-gray-400">Suggested Severity:</span> 
                          <span className="ml-2 capitalize font-semibold text-white">{detectionResult.suggestedSeverity}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-green-700">
                      📋 {detectionResult.message || 'Manual validation mode - GPS verified'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Report Information Card */}
            <div className="bg-slate-700 border border-slate-600 p-4 rounded-lg">
              <h3 className="font-medium text-gray-300 mb-2 text-sm">
                Report Information
              </h3>
              <div className="space-y-1 text-sm text-gray-400">
                <p>
                  Reported by: <span className="font-medium text-white">{user?.name}</span>
                </p>
                <p>
                  Date: <span className="font-medium text-white">{new Date().toLocaleDateString()}</span>
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !detectionResult || !gpsData || isValidating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Submitting Report...' : 
               !gpsData ? 'Upload Geotagged Image to Continue' :
               !detectionResult ? 'Validating Image...' :
               'Submit Pothole Report'}
            </button>
            
            {!gpsData && formData.image && (
              <p className="text-sm text-red-400 text-center bg-red-900/20 border border-red-700/50 rounded-lg px-4 py-2">
                Image must contain GPS location data
              </p>
            )}
            
            {gpsData && !detectionResult && isValidating && (
              <p className="text-sm text-gray-500 text-center">
                Please wait for image validation to complete
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportPothole;
