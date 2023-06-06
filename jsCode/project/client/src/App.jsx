import 'bootstrap/dist/css/bootstrap.min.css';
// import react / bootstrap libraries
import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import components
import My_Header from './Components/My_Header'
import My_Login from './Components/My_Login'

function App() {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const loginSuccessful = (user) => {
    setUser(user);
    setLoggedIn(true);
  }
  
  const mainProps = {
    user: user,
    loggedIn: loggedIn,
    setUser: setUser,
    setLoggedIn: setLoggedIn,
  }

  return (
    <BrowserRouter>
      <div style={{height:"100vh"}}>
        <My_Header {...mainProps}/>
        <Routes>
          <Route path='/' />
          <Route path='/login' element={loggedIn? <Navigate replace to='/' />:  <My_Login loginSuccessful={loginSuccessful} />} />

        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
