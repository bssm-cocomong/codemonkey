import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    @font-face {
      font-family: 'Galmuri11';
      src: url('/fonts/Galmuri11.woff2') format('woff2'),
      font-weight: normal;
      font-style: normal;
    }
    
    * { font-family: 'Galmuri11', monospace; }
`;

export default GlobalStyle;
