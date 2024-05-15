import styled from 'styled-components';

export const HiddenDiv = styled.div`
  white-space: pre-wrap;
  word-wrap: break-word;
  visibility: hidden;
  pointer-events: none;
  position: absolute;
  overflow: hidden;
  height: auto;
  min-height: 20px;
  width: 100%;
  box-sizing: border-box;
`;
