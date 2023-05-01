import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import RegistrationForm from './RegistrationForm';
import LoginForm from './LoginForm';
import { gql, useMutation } from '@apollo/client';

const LOGIN_MUTATION = gql`
  mutation loginMutation($username: String!, $password: String!) {
    loginMutation(username: $username, password: $password) {
      success
      token
      user {
        id
        username
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation registerMutation($username: String!, $password: String!) {
    registerMutation(username: $username, password: $password) {
      success
    }
  }
`;

const AuthPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const [submitMutation, { loading }] = useMutation(
    isLogin ? LOGIN_MUTATION : REGISTER_MUTATION
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username || !password) {
      setIsModalOpen(true);
      return;
    }
    const formData = {
      username,
      password
    };
    try {
      const { data } = await submitMutation({
        variables: formData
      });
      if (isLogin) {
        const token = data.loginMutation.token;
        const user = data.loginMutation.user;
        if (data.loginMutation.success) {
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('user', JSON.stringify(user));
          navigate('/');
        } else {
          console.log('login err');
        }
      } else {
        if (data.registerMutation.success) {        
          setIsLogin(!isLogin);
        } else {
          console.log('reg err');
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSwitch = () => {
    setIsLogin(!isLogin);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h2 className="h2">{isLogin ? 'Login' : 'Register'}</h2>
        {isLogin ? (
          <LoginForm
            formData={{ username, password }}
            handleChange={(event) =>
              event.target.name === 'username'
                ? setUsername(event.target.value)
                : setPassword(event.target.value)
            }      
            handleSwitchToRegister={handleSwitch}
          />
        ) : (
          <RegistrationForm
            formData={{ username, password }}
            handleChange={(event) =>
              event.target.name === 'username'
                ? setUsername(event.target.value)
                : setPassword(event.target.value)
            }
            handleSwitchToLogin={handleSwitch}
          />
        )}
      </div>
      <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
        <h2>Please fill in all fields</h2>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </form>
  );
};

export default AuthPage;