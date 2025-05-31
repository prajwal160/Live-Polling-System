import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
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

const PollContainer = styled.div`
  background: #2d2d2d;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border: 1px solid #404040;
  margin-bottom: 20px;
`;

const Question = styled.h2`
  color: #e0e0e0;
  margin-top: 0;
  margin-bottom: 20px;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const OptionButton = styled.button`
  background: ${props => props.selected ? '#6c5ce7' : '#363636'};
  color: white;
  border: 1px solid ${props => props.selected ? '#5a4bd1' : '#404040'};
  padding: 15px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-size: 16px;

  &:hover {
    background: ${props => props.selected ? '#5a4bd1' : '#404040'};
  }

  &:disabled {
    background: #4a4a4a;
    cursor: not-allowed;
  }
`;

const Timer = styled.div`
  color: #b0b0b0;
  font-size: 14px;
  margin-top: 15px;
  text-align: center;
`;

const NoPollMessage = styled.div`
  color: #b0b0b0;
  text-align: center;
  padding: 40px;
  background: #2d2d2d;
  border-radius: 10px;
  border: 1px solid #404040;
`;

const ResultsContainer = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #404040;
`;

const ResultTitle = styled.h3`
  color: #e0e0e0;
  margin-bottom: 15px;
`;

const ResultBar = styled.div`
  background: #404040;
  height: 24px;
  border-radius: 12px;
  position: relative;
  margin-bottom: 10px;
  overflow: hidden;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.percentage}%;
    background: #6c5ce7;
    transition: width 0.3s ease;
  }
`;

const ResultText = styled.div`
  display: flex;
  justify-content: space-between;
  color: #b0b0b0;
  font-size: 14px;
  margin-bottom: 5px;
`;

const StudentDashboard = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  return (
    <Container>
      <Header>
        <Title>Student Dashboard</Title>
        <HistoryButton>History</HistoryButton>
      </Header>

      <PollContainer>
        <Question>What is your favorite programming language?</Question>
        <OptionsList>
          <OptionButton selected={selectedOption === 'JavaScript'} onClick={() => handleOptionSelect('JavaScript')}>JavaScript</OptionButton>
          <OptionButton selected={selectedOption === 'Python'} onClick={() => handleOptionSelect('Python')}>Python</OptionButton>
          <OptionButton selected={selectedOption === 'Java'} onClick={() => handleOptionSelect('Java')}>Java</OptionButton>
          <OptionButton selected={selectedOption === 'C++'} onClick={() => handleOptionSelect('C++')}>C++</OptionButton>
        </OptionsList>
      </PollContainer>

      <Timer>Time Remaining: 00:00</Timer>

      <NoPollMessage>No poll available</NoPollMessage>

      <ResultsContainer>
        <ResultTitle>Poll Results</ResultTitle>
        <ResultBar percentage={selectedOption ? 100 : 0}></ResultBar>
        <ResultText>JavaScript: 50%</ResultText>
        <ResultText>Python: 30%</ResultText>
        <ResultText>Java: 10%</ResultText>
        <ResultText>C++: 10%</ResultText>
      </ResultsContainer>
    </Container>
  );
};

export default StudentDashboard; 