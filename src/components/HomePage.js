import React, { useState, useEffect } from 'react';
import AddRecordForm from './AddRecordForm';
import { useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { ApolloClient, InMemoryCache } from '@apollo/client';

const GET_WEIGHTS = gql`
  query getWeights ($userId: String!, $token: String!) {
    getWeights (userId: $userId, token: $token) {
      _id
      date
      weight
      files {
        _id
        file
      }
    }
  }
`;

const EXIT_MUTATION = gql`
  mutation exitMutation ($user: UserInput!, $token: String!) {
    exitMutation (user: $user, token: $token) {
      user {
        username
        id
      }
      token
    }
  }
`;

const ADD_MUTATION = gql`
  mutation addMutation ($userId: String, $token: String, $data: WeightInput, $files: [FileU]){
    addMutation (userId: $userId, token: $token, data: $data, files: $files){
      success
    }
  }
`

const DELETE_MUTATION = gql`
  mutation deleteMutation ($userId: String, $token: String, $id: String){
    deleteMutation (userId: $userId, token: $token, id: $id){
      success
    }
  }
`

const FDEL_MUTATION = gql`
  mutation fdelMutation ($userId: String, $token: String, $id: String){
    fdelMutation (userId: $userId, token: $token, id: $id){
      success
    }
  }
`

const EDIT_MUTATION = gql`
  mutation editMutation ($userId: String, $token: String, $id: String, $date: String, $weight: String){
    editMutation (userId: $userId, token: $token, id: $id, date: $date, weight: $weight){
      success
    }
  }
`

function HomePage() {
  const [records, setRecords] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [editDateValue, setEditDateValue] = useState('');
  const [editWeightValue, setEditWeightValue] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, []);

  const client = new ApolloClient({
    uri: '/graphql',
    cache: new InMemoryCache(),
  });

  const fetchRecords = () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const token = sessionStorage.getItem('token');
    const userId = user?.id;
    client.query({
      query: GET_WEIGHTS,
      variables: {
        userId,
        token
      }
    }).then((result) => {
      if (result.data && result.data.getWeights) {
        const records = result.data.getWeights.map((record) => ({
          id: record._id,
          date: new Date(parseInt(record.date)),
          weight: record.weight,
          files: record.files.map((file) => ({
            id: file._id,
            file: file.file,
            url: `/uploads/${file.file}`,
          })),
        }));
        setRecords(records);
      } else {
        navigate('/auth');
      }
    })
    .catch((error) => {
      navigate('/auth');
    });
  }

  const exit = () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const token = sessionStorage.getItem('token');
    client.mutate({
      mutation: EXIT_MUTATION,
      variables: {
        user: {
          username: user.username,
          id: user.id
        },
        token: token
      }
    }).then(result => {
      const token = result.data.exitMutation.token;
      const user = result.data.exitMutation.user;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      navigate('/auth');
    }).catch((error) => {
      console.error(error);
    });
  }

  const addRecord = (record) => {
    const weight = {
      date: '',
      weight: ''
    };
    const files = [];
    let i = 0;
    for (const [key, value] of record.entries()) {
      switch (key) {
        case 'date':
          weight.date = value;
          break;
        case 'weight':
          weight.weight = value;
          break;
        case 'file':
          files[i] = value;
          i++;
          break;
      }
    } 
    const fileNames = files.map(file => file.name);
    const filePromises = [];
    for (let i = 0; i < files.length; i++) {
      filePromises.push(fileToBase64(files[i]));
    }
    const user = JSON.parse(sessionStorage.getItem('user'));
    const userId = user.id;
    const token = sessionStorage.getItem('token');
    Promise.all(filePromises).then(fileBase64DataArray => {
      const fileUs = fileBase64DataArray.map((fileBase64, index) => ({
        payload: fileBase64,
        name: fileNames[index]
      }));
      client.mutate({
        mutation: ADD_MUTATION,
        variables: {
          userId: userId,
          token: token,
          data: {
            date: weight.date,
            weight: weight.weight
          },
          files: fileUs
        }
      }).then(result => {
        if (result.data.addMutation.success == true) {
          fetchRecords();
        }
      }).catch((error) => {
        console.error(error);
      });
    });
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]); 
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const deleteRecord = id => {
    const user = JSON.parse(sessionStorage.getItem('user')); 
    const userId = user.id;
    const token = sessionStorage.getItem('token');
    client.mutate({
      mutation: DELETE_MUTATION,
      variables: {
        userId: userId,
        token: token,
        id: id
      }
    }).then(result => {
      if (result.data.deleteMutation.success == true) {
        fetchRecords();
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  const deleteFile = id => {
    const user = JSON.parse(sessionStorage.getItem('user')); 
    const userId = user.id;
    const token = sessionStorage.getItem('token');
    client.mutate({
      mutation: FDEL_MUTATION,
      variables: {
        userId: userId,
        token: token,
        id: id
      }
    }).then(result => {
      if (result.data.fdelMutation.success == true) {
        fetchRecords();
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  const editRecord = (id, updatedRecord) => {
    const user = JSON.parse(sessionStorage.getItem('user')); 
    const userId = user.id;
    const token = sessionStorage.getItem('token');
    client.mutate({
      mutation: EDIT_MUTATION,
      variables: {
        userId: userId,
        token: token,
        id: id,
        date: updatedRecord.date,
        weight: updatedRecord.weight
      }
    }).then(result => {
      if (result.data.editMutation.success == true) {
        fetchRecords();
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  const handleTableClick = (event) => {
    const isInputCellClicked = event.target.closest(".input-cell");
    if (!isInputCellClicked) {
      setEditIndex(-1);
    }
  };

  const handleEditClick = (index, value_d, value_w) => {
    setEditIndex(index);
    setEditDateValue(value_d);
    setEditWeightValue(value_w);
  };

  const handleDateChange = (event) => {
    setEditDateValue(event.target.value);
  };

  const handleWeightChange = (event) => {
    setEditWeightValue(event.target.value);
  };

  const handleKeyPress = (event, index, field) => {
    if (event.key === 'Enter') {
      setEditIndex(-1);
      const id = records[index].id;
      if (field == 'weight') { 
        const updatedRecord = { weight: editWeightValue };
        editRecord(id, updatedRecord);
      }     
      else if (field == 'date') {
        const updatedRecord = { date: editDateValue };
        editRecord(id, updatedRecord);
      }       
    }
  };

 const handleBlurWeight = (index) => {
    setEditIndex(-1);
    const id = records[index].id;
    const updatedRecord = { weight: editWeightValue };
    editRecord(id, updatedRecord);
  };

  const handleBlurDate = (index) => {
    setEditIndex(-1);
    const id = records[index].id;
    const updatedRecord = { date: editDateValue };
    editRecord(id, updatedRecord);
  };

  return (
    <div className="page">
      <div className="ext-btn">
      <button className="exit-btn btn btn-sm btn-outline-danger" onClick={exit}>Exit</button>
      </div>
      <AddRecordForm onAddRecord={addRecord} />
      <div className="table-cont">
      <h2 className="progr">Progress</h2>
      <table className="table" onClick={handleTableClick}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Weight (kg)</th>
            <th className="th-file">File</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(records) && records.map((record, index) => (
            <tr key={record._id}>
              
              <td style={{ width: '240px' }} className={`input-cell ${
                  editIndex === index ? "editing" : ""
                }`}
                onClick={() => handleEditClick(index, new Date(record.date).toISOString().substring(0, 10), record.weight)}
              >
              {editIndex === index ? (
                <input
                  type="date"
                  value={editDateValue}
                  onChange={handleDateChange}
                  onKeyPress={(event) => handleKeyPress(event, index, 'date')}
                  onBlur={() => handleBlurDate(index)}
                  style={{ width: '120px', height: '22px' }}
                />
              ) : (
                new Date(record.date).toLocaleDateString()
              )}
              </td>

              <td style={{ width: '240px' }} className={`input-cell ${
                  editIndex === index ? "editing" : ""
                }`}
                onClick={() => handleEditClick(index, new Date(record.date).toISOString().substring(0, 10), record.weight)}
              >
              {editIndex === index ? (
                <input
                  type="number"
                  value={editWeightValue}
                  onChange={handleWeightChange}
                  onKeyPress={(event) => handleKeyPress(event, index, 'weight')}
                  onBlur={() => handleBlurWeight(index)}
                  style={{ width: '40px', height: '22px' }}
                />
              ) : (
                record.weight
              )}
              </td>

              <td className="file-cell">
                {record.files && record.files.length > 0 ? (
                  record.files.map((file) => (
                    <div key={file._id}>
                    <a href={`../../uploads/${file.file}`} target="_blank" type="application/octet-stream" style={{ paddingRight: '8px' }}>
                    {file.file}
                    </a>
                  <button className="del-f-btn btn btn-sm btn-outline-danger" onClick={() => deleteFile(file.id)}>-</button>
                  </div>
                  ))
                ) : (
                  'No file'
                )}
              </td>

              <td>
                <button className="del-btn btn btn-sm btn-outline-danger" onClick={() => deleteRecord(record.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default HomePage;