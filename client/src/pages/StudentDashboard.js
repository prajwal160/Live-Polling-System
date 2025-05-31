import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import socketService from '../services/socketService';
import Chat from '../components/Chat';
import Navbar from '../components/Navbar';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const { currentPoll, results, timeRemaining } = useSelector((state) => state.poll);
  const { name } = useSelector((state) => state.user);

  useEffect(() => {
    // Check if user is authenticated
    if (!name) {
      navigate('/');
      return;
    }

    // Handle page refresh
    const handleBeforeUnload = () => {
      // Clear any stored state
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    console.log('Student dashboard mounted, joining as:', name);
    socketService.connect();
    socketService.joinAsStudent(name);

    return () => {
      console.log('Student dashboard unmounting, disconnecting socket');
      socketService.disconnect();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [name, navigate]);

  useEffect(() => {
    if (currentPoll) {
      console.log('Received new poll in student dashboard:', currentPoll);
      setSelectedOption('');
      setHasAnswered(false);
    }
  }, [currentPoll]);

  const handleSubmit = () => {
    if (selectedOption) {
      console.log('Submitting answer:', selectedOption);
      socketService.submitAnswer(selectedOption);
      setHasAnswered(true);
    }
  };

  const calculatePercentage = (option) => {
    if (!results || Object.keys(results).length === 0) return 0;
    const totalVotes = Object.values(results).length;
    if (totalVotes === 0) return 0;
    
    const optionVotes = Object.values(results).filter(vote => vote === option.text).length;
    return Math.round((optionVotes / totalVotes) * 100);
  };

  const getVotesForOption = (option) => {
    if (!results) return 0;
    return Object.values(results).filter(vote => vote === option.text).length;
  };

  return (
    <>
      <Navbar 
        role="student"
        onShowPollHistory={() => navigate('/poll-history')}
      />
      <PageContainer >
        <MainContent>
          {!currentPoll ? (
            <WaitingMessage  style={{backgroundColor: 'black'}}>
              <h2 style={{color: 'white' }}>Welcome, {name}</h2>
              <p  style={{color: 'aqua' }}>Waiting for the teacher to start a poll...</p>
            </WaitingMessage>
          ) : (
            <PollContainer>
              <Question>{currentPoll.question}</Question>
              <Timer>Time remaining: {Math.ceil(timeRemaining / 1000)}s</Timer>
              
              <OptionsContainer>
                {currentPoll.options.map((option, index) => (
                  <OptionWrapper key={index}>
                    <Option
                      selected={selectedOption === option.text}
                      disabled={hasAnswered}
                      onClick={() => !hasAnswered && setSelectedOption(option.text)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <OptionLetter selected={selectedOption === option.text}>
                          {String.fromCharCode(65 + index)}
                        </OptionLetter>
                        <OptionText>{option.text}</OptionText>
                      </div>
                      {hasAnswered && (
                        <div style={{ marginTop: '10px' }}>
                          <Progress>
                            <ProgressFill 
                              width={calculatePercentage(option)}
                              isCorrect={option.isCorrect}
                            />
                          </Progress>
                          <VoteCount>
                            {getVotesForOption(option)} votes ({calculatePercentage(option)}%)
                          </VoteCount>
                        </div>
                      )}
                    </Option>
                  </OptionWrapper>
                ))}
              </OptionsContainer>

              <SubmitButton
                onClick={handleSubmit}
                disabled={!selectedOption || hasAnswered}
              >
                Submit Answer
              </SubmitButton>
            </PollContainer>
          )}
        </MainContent>
        <Chat isTeacher={false} />
      </PageContainer>
    </>
  );
};

const PageContainer = styled.div`
  min-height: 100vh;
  background-color:  #1E1E2F;
  position: relative;
  padding-top: 64px; /* Add padding for navbar */
`;

const MainContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 64px);
  padding: 20px;
`;

const WaitingMessage = styled.div`
  text-align: center;
  background: white;
  padding: 60px;
  border-radius: 10px;
  border: 0.5px solid rgb(206, 235, 235);
  box-shadow: 0 2px 4px rgba(31, 236, 236, 0.1);
  margin-top: 40px;

  h2 {
    margin-bottom: 10px;
  }

  p {
    color: #666;
  }
`;

const PollContainer = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  margin-top: 40px;
`;

const Question = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: white;
  background: #2d3436;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const Timer = styled.div`
  background: #ff4757;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: 600;
  font-size: 14px;
`;

const OptionsContainer = styled.div`
  display: grid;
  gap: 12px;
  margin: 20px 0;
`;

const OptionWrapper = styled.div`
  width: 100%;
`;

const Option = styled.div`
  width: 100%;
  padding: 15px;
  border: 2px solid ${props => props.selected ? '#6c5ce7' : '#dfe6e9'};
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  background: ${props => props.selected ? '#f1f0ff' : 'white'};
  opacity: ${props => props.disabled && !props.selected ? 0.6 : 1};

  &:hover:not([disabled]) {
    border-color: #6c5ce7;
    background: ${props => props.selected ? '#f1f0ff' : '#fafafa'};
  }
`;

const OptionLetter = styled.span`
  font-weight: 600;
  margin-right: 10px;
  color: ${props => props.selected ? '#6c5ce7' : '#636e72'};
`;

const OptionText = styled.div`
  font-size: 14px;
  color: #2d3436;
  display: inline-block;
`;

const Progress = styled.div`
  width: 100%;
  height: 30px;
  background: #f0f0f0;
  border-radius: 15px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => Math.max(0, Math.min(100, props.width))}%;
  background: ${props => props.isCorrect ? '#2ecc71' : '#6c5ce7'};
  transition: width 0.3s ease;
  opacity: ${props => props.isCorrect ? 1 : 0.8};
`;

const VoteCount = styled.div`
  font-size: 12px;
  color: #636e72;
  margin-top: 4px;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 15px;
  background: #6c5ce7;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover:not(:disabled) {
    background: #5a4bd1;
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

export default StudentDashboard; 