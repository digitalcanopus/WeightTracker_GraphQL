import React from 'react';

const RegistrationForm = ({ username, password, handleChange, handleSubmit, handleSwitchToLogin }) => {

  return (   
    <div className="auth">
      <div>
        <label>
          Username:
          <input type="text" className="add-inps" name="username" value={username} onChange={handleChange} required />
        </label>
      </div> 
      <div>
        <label>
          Password:
          <input type="password" className="add-inps" name="password" value={password} onChange={handleChange} required />
        </label>
      </div>
      <button className="reg-btn btn btn-sm btn-outline-danger" type="submit" onClick={handleSubmit}>Register</button>
      <button className="switch-btn btn btn-sm btn-outline-danger" onClick={handleSwitchToLogin}>Switch to Log in</button>  
    </div> 
  );
};

export default RegistrationForm;