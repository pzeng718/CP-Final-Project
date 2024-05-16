import TodoList from './components/TodoList';
import AuthForm from './components/AuthForm';
import axios from 'axios';
import React, { useState, useEffect} from 'react';
import './App.css';
import UserInfo from './components/UserInfo';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(-1);

    useEffect(() => {
        axios.get('http://cppart2-web-1295080897.us-east-2.elb.amazonaws.com:3000/auth/validate', { withCredentials: true })
            .then(response => {
                if (response.status === 200) {
                    setIsAuthenticated(true);
                }
            })
            .catch(() => {
                setIsAuthenticated(false);
            });
    }, []);
	return (
        <div>
            {
                isAuthenticated ?
                    <div className="App">
                        <UserInfo />
                        <TodoList userId={userId} setUserId={setUserId}/>
                    </div>
                : <AuthForm setAuth={setIsAuthenticated} setUserId={setUserId}/>
            }
        </div>
	);
}

export default App;
