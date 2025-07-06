import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GlobalStyle from './styles/GlobalStyle';
import HomePage from './pages/HomePage';
import TypingPage from './pages/TypingPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <GlobalStyle />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/typing" element={<TypingPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
