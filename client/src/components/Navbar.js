import React from 'react';
import styled from 'styled-components';

const Navbar = ({ role, onShowPollHistory }) => {
  return (
    <NavContainer>
      <NavContent>
        <NavTitle>
          {role === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}
        </NavTitle>
        <NavButtons>
          <HistoryButton onClick={onShowPollHistory}>
            Poll History
          </HistoryButton>
        </NavButtons>
      </NavContent>
    </NavContainer>
  );
};

const NavContainer = styled.nav`
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3436;
  margin: 0;
`;

const NavButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const HistoryButton = styled.button`
  background: #6c5ce7;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-weight: 500;

  &:hover {
    background: #5a4bd1;
  }
`;

export default Navbar; 