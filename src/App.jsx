import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [weightUnit, setWeightUnit] = useState('kg');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [gender, setGender] = useState('male');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoClick = () => {
    document.getElementById('photo-upload').click();
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoFile) {
      setError('Please upload a photo.');
      return;
    }

    setIsLoading(true);
    setError('');
    setReport('');

    try {
      const imageBase64 = await convertFileToBase64(photoFile);

      const response = await fetch('/api/style-consulting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          height,
          weight,
          weightUnit,
          gender,
          image: imageBase64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      setReport(data.report);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Personal Stylist (Preview)</h1>
      <p>Please provide your information below to get started.</p>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Your Photo</label>
          <div className="photo-preview" onClick={handlePhotoClick}>
            {photoPreview ? <img src={photoPreview} alt="User" /> : <span>+</span>}
          </div>
          <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} />
        </div>

        <div className="form-group">
          <label htmlFor="height">Height (cm)</label>
          <input
            id="height"
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Enter your height"
            required
          />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <div className="gender-options">
            <label>
              <input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={(e) => setGender(e.target.value)} />
              <span>Male</span>
            </label>
            <label>
              <input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={(e) => setGender(e.target.value)} />
              <span>Female</span>
            </label>
            <label>
              <input type="radio" name="gender" value="other" checked={gender === 'other'} onChange={(e) => setGender(e.target.value)} />
              <span>Other</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="weight">Weight</label>
          <div className="weight-input">
            <input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter your weight"
              required
            />
            <div className="unit-selector">
              <button type="button" className={weightUnit === 'kg' ? 'active' : ''} onClick={() => setWeightUnit('kg')}>kg</button>
              <button type="button" className={weightUnit === 'lbs' ? 'active' : ''} onClick={() => setWeightUnit('lbs')}>lbs</button>
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Get My Style Analysis'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Our AI stylist is analyzing your profile... Please wait.</p>
        </div>
      )}

      {report && (
        <div className="report-container">
          <h2>Your Personal Style Report</h2>
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default App;

