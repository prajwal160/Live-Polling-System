import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PollHistory = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { role } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/polls/history');
        setPolls(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching polls:', error);
        setError('Failed to load poll history');
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  const handleBack = () => {
    navigate(role === 'teacher' ? '/teacher' : '/student');
  };

  if (loading) return <LoadingMessage>Loading poll history...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (polls.length === 0) return <EmptyMessage>No polls in history</EmptyMessage>;

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>
          ← Back to Dashboard
        </BackButton>
        <Title>Poll History</Title>
      </Header>
      <PollList>
        {polls.map((poll, index) => (
          <PollCard key={poll._id}>
            <PollNumber>Poll #{polls.length - index}</PollNumber>
            <Question>{poll.question}</Question>
            <OptionsContainer>
              {poll.options.map((option, optIndex) => {
                const votes = Object.values(poll.results).filter(vote => vote === option.text).length;
                const totalVotes = Object.keys(poll.results).length;
                const percentage = totalVotes ? ((votes / totalVotes) * 100).toFixed(1) : 0;
                
                return (
                  <OptionItem key={optIndex}>
                    <OptionText>
                      {option.text}
                      {role === 'teacher' && option.isCorrect && (
                        <CorrectBadge>✓ Correct</CorrectBadge>
                      )}
                    </OptionText>
                    <VoteBar percentage={percentage}>
                      <VotePercentage>{percentage}%</VotePercentage>
                    </VoteBar>
                    <VoteCount>{votes} vote{votes !== 1 ? 's' : ''}</VoteCount>
                  </OptionItem>
                );
              })}
            </OptionsContainer>
            <PollInfo>
              <InfoItem>
                Duration: {poll.duration / 1000}s
              </InfoItem>
              <InfoItem>
                Date: {new Date(poll.startTime).toLocaleDateString()}
              </InfoItem>
              <InfoItem>
                Time: {new Date(poll.startTime).toLocaleTimeString()}
              </InfoItem>
            </PollInfo>
          </PollCard>
        ))}
      </PollList>
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
`;

const BackButton = styled.button`
  background: #6c5ce7;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;

  &:hover {
    background: #5a4bd1;
  }
`;

const Title = styled.h1`
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
`;

const PollList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PollCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PollNumber = styled.div`
  font-size: 14px;
  color: #6c5ce7;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Question = styled.h2`
  color: #2c3e50;
  font-size: 18px;
  margin-bottom: 20px;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const OptionItem = styled.div`
  margin-bottom: 10px;
`;

const OptionText = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
  font-weight: 500;
`;

const CorrectBadge = styled.span`
  background: #00b894;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
`;

const VoteBar = styled.div`
  background: #f0f0f0;
  height: 24px;
  border-radius: 12px;
  position: relative;
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

const VotePercentage = styled.span`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  z-index: 1;
  font-size: 12px;
  font-weight: bold;
`;

const VoteCount = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 5px;
`;

const PollInfo = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
`;

const InfoItem = styled.span`
  font-size: 14px;
  color: #666;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #e74c3c;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

export default PollHistory; 