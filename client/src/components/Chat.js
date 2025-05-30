import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import socketService from '../services/socketService';

const Chat = ({ isTeacher }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [kickedStudents, setKickedStudents] = useState(new Set());
  const { name, role } = useSelector((state) => state.user);
  const { connectedUsers, messages: storeMessages } = useSelector((state) => state.poll);

  useEffect(() => {
    setMessages(storeMessages || []);
  }, [storeMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      socketService.sendMessage(message);
      setMessage('');
    }
  };

  const handleKickStudent = (studentName) => {
    if (isTeacher) {
      socketService.kickStudent(studentName);
      setKickedStudents(prev => new Set([...prev, studentName]));
      setMessages([...messages, {
        sender: 'System',
        text: `${studentName} has been kicked from the session`,
        timestamp: Date.now(),
        isSystem: true
      }]);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Only hide chat if we're on the kicked page
  if (window.location.pathname === '/kicked') return null;

  // Don't show chat until role is selected
  if (!role) return null;

  return (
    <ChatWrapper>
      <ChatIcon onClick={toggleChat} isOpen={isOpen}>
        💬
      </ChatIcon>

      {isOpen && (
        <ChatContainer>
          <TabsContainer>
            <TabsWrapper>
              <Tab 
                active={activeTab === 'chat'} 
                onClick={() => setActiveTab('chat')}
              >
                Chat
              </Tab>
              <Tab 
                active={activeTab === 'participants'} 
                onClick={() => setActiveTab('participants')}
              >
                Participants {connectedUsers.length > 0 && `(${connectedUsers.length})`}
              </Tab>
            </TabsWrapper>
            <CloseButton onClick={toggleChat}>×</CloseButton>
          </TabsContainer>

          <ChatContent>
            {activeTab === 'chat' ? (
              <>
                <MessagesContainer>
                  {messages.map((msg, index) => (
                    <MessageBubble 
                      key={index} 
                      isOwn={msg.sender === name}
                      isSystem={msg.isSystem}
                    >
                      {!msg.isSystem && <SenderName>{msg.sender}</SenderName>}
                      <MessageText>{msg.text}</MessageText>
                    </MessageBubble>
                  ))}
                </MessagesContainer>

                <ChatInputContainer>
                  <ChatInput
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <SendButton onClick={handleSendMessage}>Send</SendButton>
                </ChatInputContainer>
              </>
            ) : (
              <ParticipantsList>
                {connectedUsers.map((student, index) => (
                  <ParticipantItem key={index}>
                    <ParticipantName>
                      {student}
                      {student === name && " (You)"}
                    </ParticipantName>
                    {isTeacher && student !== name && (
                      kickedStudents.has(student) ? (
                        <KickedButton disabled>Kicked</KickedButton>
                      ) : (
                        <KickButton onClick={() => handleKickStudent(student)}>
                          Kick
                        </KickButton>
                      )
                    )}
                  </ParticipantItem>
                ))}
              </ParticipantsList>
            )}
          </ChatContent>
        </ChatContainer>
      )}
    </ChatWrapper>
  );
};

const ChatWrapper = styled.div`
  position: fixed;
  bottom: 100px;
  right: 80px;
  z-index: 1000;
`;

const ChatIcon = styled.div`
  width: 50px;
  height: 50px;
  background: #6c5ce7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
  font-size: 24px;
  color: white;
  opacity: ${props => props.isOpen ? 0 : 1};
  pointer-events: ${props => props.isOpen ? 'none' : 'auto'};

  &:hover {
    transform: scale(1.1);
  }
`;

const ChatContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 300px;
  height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  position: relative;
  align-items: stretch;
`;

const TabsWrapper = styled.div`
  display: flex;
  flex: 1;
  margin-right: 40px; /* Space for close button */
`;

const Tab = styled.div`
  flex: 1;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  background: ${props => props.active ? '#6c5ce7' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  font-weight: ${props => props.active ? '600' : 'normal'};
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background: ${props => props.active ? '#6c5ce7' : '#f8f9fa'};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  width: 40px;
  height: 100%;
  border: none;
  background: transparent;
  color: #666;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-left: 1px solid #eee;

  &:hover {
    background: #ff4757;
    color: white;
  }
`;

const ChatContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8f9fa;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  background: ${props => {
    if (props.isSystem) return '#f8d7da';
    return props.isOwn ? '#6c5ce7' : 'white';
  }};
  color: ${props => {
    if (props.isSystem) return '#721c24';
    return props.isOwn ? 'white' : '#333';
  }};
  align-self: ${props => {
    if (props.isSystem) return 'center';
    return props.isOwn ? 'flex-end' : 'flex-start';
  }};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const SenderName = styled.div`
  font-size: 12px;
  margin-bottom: 4px;
  opacity: 0.8;
`;

const MessageText = styled.div`
  font-size: 14px;
`;

const ParticipantsList = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
`;

const ParticipantItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const ParticipantName = styled.span`
  font-size: 14px;
  color: #333;
`;

const KickButton = styled.button`
  background: #ff4757;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #ff6b81;
  }
`;

const KickedButton = styled(KickButton)`
  background: #bdc3c7;
  cursor: not-allowed;

  &:hover {
    background: #bdc3c7;
  }
`;

const ChatInputContainer = styled.div`
  padding: 15px;
  background: white;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #6c5ce7;
  }
`;

const SendButton = styled.button`
  background: #6c5ce7;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #5a4bd1;
  }
`;

export default Chat;