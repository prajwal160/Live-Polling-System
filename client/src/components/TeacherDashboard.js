import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #1a1a1a;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #e0e0e0;
  margin: 0;
`;

const HistoryButton = styled.button`
  background: #6c5ce7;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #5a4bd1;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
`;

const Section = styled.div`
  background: #2d2d2d;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border: 1px solid #404040;
`;

const SectionTitle = styled.h2`
  color: #e0e0e0;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #404040;
  background-color: #2d2d2d;
  color: #e0e0e0;

  &:focus {
    outline: none;
    border-color: #6c5ce7;
  }
`;

const Button = styled.button`
  background: #6c5ce7;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s ease;

  &:hover {
    background: #5a4bd1;
  }

  &:disabled {
    background: #4a4a4a;
    cursor: not-allowed;
  }
`;

const StudentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StudentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #363636;
  border-radius: 6px;
  border: 1px solid #404040;
`;

const StudentName = styled.span`
  color: #e0e0e0;
`;

const KickButton = styled.button`
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #ff5252;
  }
`;

const OptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const OptionInput = styled.input`
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #404040;
  background-color: #2d2d2d;
  color: #e0e0e0;

  &:focus {
    outline: none;
    border-color: #6c5ce7;
  }
`;

const Checkbox = styled.input`
  margin-right: 10px;
  cursor: pointer;
`;

const RemoveButton = styled.button`
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #ff5252;
  }
`;

const AddOptionButton = styled.button`
  background: #00b894;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 15px;
  transition: background 0.3s ease;

  &:hover {
    background: #00a187;
  }
`;

const DurationInput = styled.input`
  width: 100px;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #404040;
  background-color: #2d2d2d;
  color: #e0e0e0;

  &:focus {
    outline: none;
    border-color: #6c5ce7;
  }
`;

const NoStudentsMessage = styled.div`
  color: #b0b0b0;
  text-align: center;
  padding: 20px;
`;

const TeacherDashboard = () => {
  // ... rest of the component code ...
};

export default TeacherDashboard; 