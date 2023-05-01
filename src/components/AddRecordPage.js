import React, { useState } from 'react';
import AddRecordForm from './AddRecordForm';

function AddRecordPage(props) {
  const { onAddRecord } = props;
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddRecord = record => {
    onAddRecord(record);
    setIsSuccess(true);
  };

  const handleResetSuccess = () => {
    setIsSuccess(false);
  };

  return (
    <div>
      {isSuccess ? (
        <div>
          <p>New record added successfully!</p>
          <button onClick={handleResetSuccess}>Add another record</button>
        </div>
      ) : (
        <AddRecordForm onAddRecord={handleAddRecord} />
      )}
    </div>
  );
}

export default AddRecordPage;