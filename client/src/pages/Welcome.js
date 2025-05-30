import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { setUser } from '../store/slices/userSlice';
import socketService from '../services/socketService';

const Welcome = () => {
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleContinue = () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    if (selectedRole === 'teacher') {
      dispatch(setUser({ name, role: 'teacher' }));
      socketService.joinAsTeacher(name);
      navigate('/teacher');
    } else {
      dispatch(setUser({ name, role: 'student' }));
      socketService.joinAsStudent(name);
      navigate('/student');
    }
  };

  return (
    <Container>
      <Card>
        <Logo>📊 Intervue Poll</Logo>
        <Title>Welcome to the Live Polling System</Title>
        <Subtitle>
          Please select the role that best describes you to begin using the live polling system
        </Subtitle>

        <RoleContainer>
          <RoleCard
            selected={selectedRole === 'student'}
            onClick={() => setSelectedRole('student')}
          >
            <RoleTitle>I'm a Student</RoleTitle>
            <RoleDescription>
              Submit answers and participate in live polls
            </RoleDescription>
          </RoleCard>

          <RoleCard
            selected={selectedRole === 'teacher'}
            onClick={() => setSelectedRole('teacher')}
          >
            <RoleTitle>I'm a Teacher</RoleTitle>
            <RoleDescription>
              Create polls and view live results
            </RoleDescription>
          </RoleCard>
        </RoleContainer>

        {selectedRole && (
          <NameInput
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <ContinueButton onClick={handleContinue} disabled={!selectedRole || !name}>
          Continue
        </ContinueButton>
      </Card>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
`;

const Logo = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 30px;
`;

const RoleContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
`;

const RoleCard = styled.div`
  padding: 20px;
  border: 2px solid ${(props) => (props.selected ? '#6c5ce7' : '#e0e0e0')};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props) => (props.selected ? '#f0f0ff' : 'white')};

  &:hover {
    border-color: #6c5ce7;
  }
`;

const RoleTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 10px;
`;

const RoleDescription = styled.p`
  font-size: 14px;
  color: #666;
`;

const NameInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 16px;

  &:focus {
    border-color: #6c5ce7;
    outline: none;
  }
`;

const ContinueButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #6c5ce7;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #5a4bd1;
  }
`;

export default Welcome; 