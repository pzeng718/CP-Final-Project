import TodoList from './components/TodoList';
import AuthForm from './components/AuthForm';
import axios from 'axios';
import React, { useState, useEffect} from 'react';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:3000/validate', { withCredentials: true })
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
                        <TodoList />
                    </div>
                : <AuthForm setAuth={setIsAuthenticated}/>
            }
        </div>
	);
}

export default App;
