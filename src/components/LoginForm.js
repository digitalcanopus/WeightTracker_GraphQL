import React from 'react';

const LoginForm = ({ username, password, handleChange, handleSubmit, handleSwitchToRegister }) => {

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
      <button className="log-btn btn btn-sm btn-outline-danger" type="submit" onClick={handleSubmit}>Log in</button>
      <button className="switch-btn btn btn-sm btn-outline-danger" onClick={handleSwitchToRegister}>Switch to Register</button>
    </div>   
  );
};

export default LoginForm;

//user1 1234
//user2 12345
//user3 123
//user4 1
//user5 123