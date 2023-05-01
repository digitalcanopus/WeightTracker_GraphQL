/*import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EditRecordForm from './EditRecordForm';

const EditRecordPage = ({ records, onUpdateRecord }) => {
  const { id } = useParams();
  const record = records.find(r => r._id === id);
  const history = useNavigate();

  const handleUpdateRecord = (updatedRecord) => {
    onUpdateRecord(updatedRecord);
    history.push('/');
  };

  if (!record) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Edit Record</h1>
      <EditRecordForm record={record} onSave={handleUpdateRecord} onClose={() => history.push('/')} />
    </div>
  );
};

export default EditRecordPage;*/

import React from 'react';
import { useParams } from 'react-router-dom';
import EditRecordForm from './EditRecordForm';

const EditRecordPage = ({ records, props }) => {
  const { id } = useParams();
  const record = records.find(r => r._id === id);
  const { onEditRecord } = props;

  const handleUpdateRecord = (updatedRecord) => {
    onEditRecord(id, updatedRecord);
  };

  if (!record) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Edit Record</h1>
      <EditRecordForm record={record} onEditRecord={handleUpdateRecord} />
    </div>
  );
};

export default EditRecordPage;