import React, { useState, useRef } from 'react';

function AddRecordForm(props) {
  const [record, setRecord] = useState({ date: '', weight: '', file: null });
  const [files, setFiles] = useState([]);

  const fileInput = useRef(null);

  const handleChange = (event) => {
    const { name, value, type } = event.target;
    if (type === 'file') {
      setRecord({ ...record, [name]: event.target.files[0] });
    } else {
      setRecord(prevRecord => ({ ...prevRecord, [name]: value }));
    }
  };

  const handleAttach = (event) => {
    event.preventDefault();
    const fileList = fileInput.current.files;
    setFiles([...files, ...Array.from(fileList)]);
    fileInput.current.value = null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('date', record.date);
    formData.append('weight', record.weight);
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }
    console.log('FormData contents:');
    for (const [key, value] of formData.entries()) {
      console.log(key + ':', value);
    }
    props.onAddRecord(formData);
    setRecord({ date: '', weight: '', file: null });
    setFiles([]);
    event.target.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="add-w">
        <table className="add-form">
          <tr>
            <td className="pic-col"><img src="jotaro.png" alt="Image" width={357} height={513}/></td>
            <td>
              <div className="form-col">
              <div><input className="add-inps" type="date" name="date" placeholder="Date" value={record.date} onChange={handleChange} required /></div>      
              <div><input className="add-inp-w" type="number" name="weight" placeholder="Weight" value={record.weight} onChange={handleChange} required /></div>
              <div>
                <input className="add-inps" type="file" name="file" multiple ref={fileInput} /*onChange={handleFilesChange}*/ />
                <button className="add-f-btn btn btn-sm btn-outline-danger" onClick={handleAttach}>+</button>
              </div>
              <div><button className="add-btn btn btn-sm btn-outline-danger" type="submit">Add</button></div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </form>
  );
}

export default AddRecordForm;