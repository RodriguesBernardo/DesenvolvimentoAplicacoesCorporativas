import AuthProvider from "../context/AuthProvider";
import Header from "../components/Header";
import LoginPage from "../components/LoginPage"; 
function App() {
  return (
    <AuthProvider>
      <Header />
      <LoginPage />
    </AuthProvider>
  );
}

export default App;