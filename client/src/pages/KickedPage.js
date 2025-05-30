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
        <SubMessage>
          Please close this window and contact your teacher if you think this was a mistake.
        </SubMessage>
      </Card>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f5f5f5;
`;

const Card = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const Icon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #ff4757;
  margin-bottom: 16px;
`;

const Message = styled.p`
  color: #636e72;
  line-height: 1.5;
  font-size: 16px;
  margin-bottom: 12px;
`;

const SubMessage = styled.p`
  color: #a4b0be;
  line-height: 1.5;
  font-size: 14px;
`;

export default KickedPage; 