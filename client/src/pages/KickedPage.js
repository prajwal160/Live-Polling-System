import React from 'react';
import styled from 'styled-components';

const KickedPage = () => {
  return (
    <Container>
      <Card>
        <Icon>⚠️</Icon>
        <Title>You've Been Kicked!</Title>
        <Message>
          The teacher has removed you from the session. You can no longer participate in the polls or chat.
        </Message>
        <Instruction>
          Please close this window and contact your teacher if you think this was a mistake.
        </Instruction>
      </Card>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #1a1a1a;
  padding: 20px;
`;

const Card = styled.div`
  background: #2d2d2d;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  max-width: 500px;
  width: 100%;
  text-align: center;
  border: 1px solid #404040;
`;

const Icon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #ff6b6b;
  margin-bottom: 20px;
`;

const Message = styled.p`
  color: #e0e0e0;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const Instruction = styled.p`
  color: #b0b0b0;
  font-size: 14px;
  line-height: 1.6;
  padding-top: 20px;
  border-top: 1px solid #404040;
`;

export default KickedPage; 