import React from 'react';
import styled from 'styled-components';

const Navbar = ({ role, onShowPollHistory }) => {
  return (
    <NavContainer  style={{backgroundColor: 'black' }}>
      <NavContent>
        <NavTitle style={{ color: 'white'}}>
          {role === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}
        </NavTitle>
        <NavButtons>
          {role === 'teacher' && (
            <HistoryButton onClick={onShowPollHistory}>
              Poll History
            </HistoryButton>
          )}
        </NavButtons>
      </NavContent>
    </NavContainer>
  );
};

const NavContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
`;

const NavTitle = styled.h1`
  font-size: 20px;
  margin: 0;
`;

const NavButtons = styled.div`
  display: flex;
  gap: 10px;
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

export default Navbar; 