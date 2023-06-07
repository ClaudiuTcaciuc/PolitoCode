import 'bootstrap/dist/css/bootstrap.min.css';
// import react / bootstrap libraries
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import components
import My_Header from './Components/My_Header'
import My_Login from './Components/My_Login'
import My_Footer from './Components/My_Footer'
import My_Main from './Components/My_Main'
import API from './API';
function App() {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [app_name, setApp_name] = useState('');

  useEffect(() => {
    API.getAppName().then((name) => { setApp_name(name) });
  }, [app_name]);

  const loginSuccessful = (user) => {
    setUser(user);
    setLoggedIn(true);
  }
  
  // props for the login and header components
  const userProps = {
    user: user,
    loggedIn: loggedIn,
    setUser: setUser,
    setLoggedIn: setLoggedIn,
  }

  return (
    <BrowserRouter>
      <div style={{height:"100vh"}}>
        <My_Header {...userProps} app_name={app_name} setApp_name={setApp_name}/>
        <Routes>
          <Route path='/' element={ <My_Main {...userProps} />} />
          <Route path='/login' element={loggedIn? <Navigate replace to='/' />:  <My_Login loginSuccessful={loginSuccessful} />} />
        </Routes>
        <My_Footer loggedIn={loggedIn} />
      </div>
    </BrowserRouter>
  )
}

export default App
