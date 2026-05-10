function Login()
{
    const loginGoogle = () => {
        window.location.href = 
        "http://localhost:5236/api/auth/login";
    };

    return (
        <div style = {{padding: 40}}>
            <h1>Login Page</h1>
            <button onClick={loginGoogle}>
                Login with Google
            </button>
        </div>
    );
    
}

export default Login;