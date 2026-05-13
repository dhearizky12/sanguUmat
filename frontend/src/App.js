import logo from './logo.svg';
import './App.css';
// import {useEffect} from "react";
import {useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CompleteProfile from "./pages/CompleteProfile";
import Profile from "./pages/Profile";

function App() {

  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5236/api/auth/me",
      {
        credentials: "include"
      })
      .then(res => res.json())
      .then(data => {
        setIsAuth(data.isAuthenticated);
        setHasCompletedProfile(data.hasCompletedProfile);
        setLoading(false);
      });
  }, []);

  if (loading) 
  {
    return <h1>Loading...</h1>
  }

  return(
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element = {
          isAuth ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        }/>

        <Route
          path="/login"
          element = {
            <Login/>
          }
        />

        <Route
          path="/dashboard"
          element={
            isAuth
              ? (hasCompletedProfile ? <Dashboard/> : <Navigate to="/complete-profile" />)
              : <Navigate to="/login" />
          }
        />

        <Route
          path= "/complete-profile"
          element={<CompleteProfile/>}
        />

        <Route
          path="/profile"
          element={isAuth ? <Profile/> : <Navigate to="/login"/>}
        />

      </Routes>
    </BrowserRouter>
  );

}

export default App;
