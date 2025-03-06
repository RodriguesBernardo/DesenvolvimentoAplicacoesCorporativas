import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    function handleLogin() {
        login();
        navigate("/dashboard");
    };
    return (
        <div>
            <h1>Login</h1>
            <button className='button' onClick={handleLogin}>Login</button>
        </div>
    );
}

export default Login;
