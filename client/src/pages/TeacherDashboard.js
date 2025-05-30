import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import socketService from '../services/socketService';
import Chat from '../components/Chat';

const TeacherDashboard = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([{ text: '', isCorrect: true }]);
  const [duration, setDuration] = useState(60);
  const { currentPoll, results, timeRemaining } = useSelector((state) => state.poll);
  const { name } = useSelector((state) => state.user);

  useEffect(() => {
    // Initialize socket connection and join as teacher
    console.log('Teacher dashboard mounted, joining as:', name);
    socketService.connect();
    socketService.joinAsTeacher(name);

    return () => {
      console.log('Teacher dashboard unmounting, disconnecting socket');
      socketService.disconnect();
    };
  }, [name]);

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, { text: '', isCorrect: false }]);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text: value };
    setOptions(newOptions);
  };

  const handleCorrectChange = (index, isCorrect) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], isCorrect };
    setOptions(newOptions);
  };

  const handleCreatePoll = () => {
    const validOptions = options.filter(opt => opt.text.trim());
    if (question && validOptions.length >= 1) {
      console.log('Creating new poll:', {
        question,
        options: validOptions,
        duration: duration * 1000
      });
      
      socketService.createPoll({
        question,
        options: validOptions.map(opt => ({
          text: opt.text,
          isCorrect: opt.isCorrect
        })),
        duration: duration * 1000
      });
      
      setQuestion('');
      setOptions([{ text: '', isCorrect: true }]);
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
    <Container>
      <Header>
        <OnlineIndicator>Online Now</OnlineIndicator>
        <Title>Let's Get Started</Title>
        <Subtitle>
          You'll have the ability to create and manage polls, ask questions, and monitor
          your students' responses in real-time.
        </Subtitle>
      </Header>

      <PollCreator>
        <QuestionSection>
          <QuestionLabel>Enter your question</QuestionLabel>
          <QuestionInput
            placeholder="Type your question here"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <DurationSelect
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            <option value="30">30 seconds</option>
            <option value="60">60 seconds</option>
            <option value="90">90 seconds</option>
            <option value="120">120 seconds</option>
          </DurationSelect>
        </QuestionSection>

        <OptionsSection>
          <OptionsHeader>
            <OptionsTitle>Edit Options</OptionsTitle>
            <IsCorrectHeader>Is it Correct?</IsCorrectHeader>
          </OptionsHeader>
          {options.map((option, index) => (
            <OptionContainer key={index}>
              <OptionInputWrapper>
                <OptionNumber>{index + 1}</OptionNumber>
                <OptionInput
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder="Enter option text"
                />
              </OptionInputWrapper>
              <CorrectOptions>
                <CorrectOption
                  type="radio"
                  name={`correct-${index}`}
                  checked={option.isCorrect}
                  onChange={() => handleCorrectChange(index, true)}
                  id={`yes-${index}`}
                />
                <CorrectLabel htmlFor={`yes-${index}`}>Yes</CorrectLabel>
                <CorrectOption
                  type="radio"
                  name={`correct-${index}`}
                  checked={!option.isCorrect}
                  onChange={() => handleCorrectChange(index, false)}
                  id={`no-${index}`}
                />
                <CorrectLabel htmlFor={`no-${index}`}>No</CorrectLabel>
              </CorrectOptions>
            </OptionContainer>
          ))}
          {options.length < 4 && (
            <AddOptionButton onClick={handleAddOption}>
              + Add More option
            </AddOptionButton>
          )}
        </OptionsSection>

        <AskButton onClick={handleCreatePoll} disabled={!question || options.filter(opt => opt.text.trim()).length < 1}>
          Ask Question
        </AskButton>
      </PollCreator>

      {currentPoll && (
        <ResultsSection>
          <ResultsHeader>
            <h2>Live Results</h2>
            <TotalVotes>{Object.keys(results).length} votes</TotalVotes>
          </ResultsHeader>
          <Question>{currentPoll.question}</Question>
          <ResultsGrid>
            {currentPoll.options.map((option, index) => {
              const percentage = calculatePercentage(option);
              const votes = getVotesForOption(option);
              return (
                <ResultBar key={index}>
                  <ResultBarHeader>
                    <OptionInfo>
                      <OptionDot isCorrect={option.isCorrect}>
                        {String.fromCharCode(65 + index)}
                      </OptionDot>
                      <OptionText isCorrect={option.isCorrect}>
                        {option.text}
                      </OptionText>
                    </OptionInfo>
                    <Percentage>{percentage}%</Percentage>
                  </ResultBarHeader>
                  <Progress>
                    <ProgressFill 
                      width={percentage} 
                      isCorrect={option.isCorrect}
                    />
                  </Progress>
                  <VoteCount>
                    {votes} {votes === 1 ? 'vote' : 'votes'}
                  </VoteCount>
                </ResultBar>
              );
            })}
          </ResultsGrid>
          <Timer>Time remaining: {Math.ceil(timeRemaining / 1000)}s</Timer>
        </ResultsSection>
      )}
      <Chat isTeacher={true} />
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const OnlineIndicator = styled.div`
  display: inline-block;
  background: #6c5ce7;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 16px;
  color: #2d3436;
`;

const Subtitle = styled.p`
  color: #636e72;
  font-size: 16px;
  line-height: 1.5;
`;

const PollCreator = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const QuestionSection = styled.div`
  margin-bottom: 30px;
`;

const QuestionLabel = styled.div`
  font-size: 14px;
  color: #636e72;
  margin-bottom: 8px;
`;

const QuestionInput = styled.input`
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 15px;

  &:focus {
    border-color: #6c5ce7;
    outline: none;
  }
`;

const DurationSelect = styled.select`
  width: 150px;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;

  &:focus {
    border-color: #6c5ce7;
    outline: none;
  }
`;

const OptionsSection = styled.div`
  margin: 30px 0;
`;

const OptionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const OptionsTitle = styled.h3`
  font-size: 16px;
  color: #2d3436;
  margin: 0;
`;

const IsCorrectHeader = styled.div`
  font-size: 14px;
  color: #636e72;
  margin-right: 50px;
`;

const OptionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const OptionInputWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  margin-right: 20px;
`;

const OptionNumber = styled.div`
  width: 24px;
  height: 24px;
  background: #6c5ce7;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-right: 10px;
`;

const OptionInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    border-color: #6c5ce7;
    outline: none;
  }
`;

const CorrectOptions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 120px;
`;

const CorrectOption = styled.input`
  margin: 0;
  cursor: pointer;
`;

const CorrectLabel = styled.label`
  font-size: 14px;
  color: #636e72;
  cursor: pointer;
  margin-right: 10px;
`;

const AddOptionButton = styled.button`
  background: none;
  border: none;
  color: #6c5ce7;
  font-size: 14px;
  cursor: pointer;
  padding: 5px 0;
  margin-top: 10px;
`;

const AskButton = styled.button`
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

const ResultsSection = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TotalVotes = styled.div`
  color: #636e72;
  font-size: 14px;
`;

const Question = styled.h3`
  margin: 20px 0;
  color: #2d3436;
`;

const ResultsGrid = styled.div`
  display: grid;
  gap: 20px;
  margin: 20px 0;
`;

const ResultBar = styled.div`
  width: 100%;
`;

const ResultBarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const OptionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const OptionDot = styled.div`
  width: 24px;
  height: 24px;
  background: ${props => props.isCorrect ? '#2ecc71' : '#6c5ce7'};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const OptionText = styled.div`
  font-size: 14px;
  color: #2d3436;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.isCorrect && `
    &:after {
      content: '✓';
      color: #2ecc71;
      font-weight: bold;
    }
  `}
`;

const Percentage = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #2d3436;
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

const Timer = styled.div`
  text-align: center;
  margin-top: 20px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #2d3436;
  font-weight: 600;
`;

export default TeacherDashboard; 