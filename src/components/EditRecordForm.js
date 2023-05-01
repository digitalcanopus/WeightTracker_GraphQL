import React, { useState } from 'react';
import axios from 'axios';

const EditRecordForm = ({ record, onClose, onSave }) => {
  const [weight, setWeight] = useState(record.weight);
  const [date, setDate] = useState(new Date(record.date).toISOString().slice(0, 10));
  //const [file, setFile] = useState(record.file);
  const [file, setFile] = useState(null);

  const handleWeightChange = (e) => {
    setWeight(e.target.value);
  };
  
  const handleDateChange = (e) => {
    setDate(e.target.value);
  };
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('date', date);
    formData.append('weight', weight);
    formData.append('file', file);
  
    axios.put(`/api/weights/${record._id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(res => onSave(res.data))
    .catch(err => console.log(err));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Record</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input type="number" id="weight" name="weight" value={weight} onChange={handleWeightChange} />
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input type="date" id="date" name="date" value={date} onChange={handleDateChange} />
          </div>
          <div className="form-group">
            <label htmlFor="file">File</label>
            <input type="file" id="file" name="file" onChange={handleFileChange} />
          </div>
          <button type="submit" >Save</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default EditRecordForm;