import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const PollHistory = ({ onClose }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await fetch('/api/polls');
        const data = await response.json();
        setPolls(data);
      } catch (error) {
        console.error('Error fetching polls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Poll History</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ModalBody>
          {loading ? (
            <LoadingMessage>Loading poll history...</LoadingMessage>
          ) : polls.length === 0 ? (
            <EmptyMessage>No polls in history</EmptyMessage>
          ) : (
            <PollList>
              {polls.map((poll, index) => (
                <PollCard key={poll._id || index}>
                  <PollQuestion>{poll.question}</PollQuestion>
                  <PollOptions>
                    {poll.options.map((option, optIndex) => {
                      const votes = Object.values(poll.results).filter(
                        vote => vote === option
                      ).length;
                      const totalVotes = Object.keys(poll.results).length;
                      const percentage = totalVotes
                        ? ((votes / totalVotes) * 100).toFixed(1)
                        : 0;

                      return (
                        <OptionItem key={optIndex}>
                          <OptionHeader>
                            <OptionText>{option}</OptionText>
                            <VoteInfo>{votes} votes ({percentage}%)</VoteInfo>
                          </OptionHeader>
                          <ProgressBar>
                            <ProgressFill width={percentage} />
                          </ProgressBar>
                        </OptionItem>
                      );
                    })}
                  </PollOptions>
                  <PollInfo>
                    <InfoItem>
                      <InfoLabel>Started:</InfoLabel>
                      <InfoValue>{new Date(poll.startTime).toLocaleString()}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Duration:</InfoLabel>
                      <InfoValue>{poll.duration / 1000} seconds</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Total Responses:</InfoLabel>
                      <InfoValue>{Object.keys(poll.results).length}</InfoValue>
                    </InfoItem>
                  </PollInfo>
                </PollCard>
              ))}
            </PollList>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #2d3436;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #636e72;
  cursor: pointer;
  padding: 0.5rem;
  
  &:hover {
    color: #2d3436;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #636e72;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #636e72;
`;

const PollList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PollCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
`;

const PollQuestion = styled.h3`
  margin: 0 0 1rem 0;
  color: #2d3436;
  font-size: 1.2rem;
`;

const PollOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const OptionItem = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 6px;
`;

const OptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const OptionText = styled.span`
  font-weight: 500;
`;

const VoteInfo = styled.span`
  color: #636e72;
  font-size: 0.9rem;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background: #6c5ce7;
  transition: width 0.3s ease;
`;

const PollInfo = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InfoLabel = styled.span`
  color: #636e72;
  font-size: 0.9rem;
`;

const InfoValue = styled.span`
  color: #2d3436;
  font-weight: 500;
`;

export default PollHistory; 