import React, { useCallback, useEffect, useState, useMemo } from 'react';
import moment from 'moment';
import axios from 'axios';
import dayjs from 'dayjs';
import { debounce, update } from 'lodash';
import { AutoComplete, Button, DatePicker, Input, Modal, Select, message } from 'antd';
import Cookies from 'js-cookie';
import socketIOClient from 'socket.io-client';
import TodoItem from './TodoItem';
import DateSelector from './DateSelector';
const { TextArea } = Input;

const backendUrl = 'http://cppart2-web-1295080897.us-east-2.elb.amazonaws.com:3000';

function TodoList({userId, setUserId}) {
    const MODE_ADD = 1;
    const MODE_EDIT = 2;
    const [curMode, setCurMode] = useState(1);
    const [joinedRooms, setJoinedRooms] = useState([]);
    const [todos, setTodos] = useState([]);
    const [autoCompOptions, setAutoCompOptions] = useState([]);
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(moment());
    const [selectedDate, setSelectedDate] = useState(moment().format('MM-DD'));
    const [priority, setPriority] = useState('Low');
    const [editingId, setEditingId] = useState(null); 
    const [showTodoDetailModal, setShowTodoDetailModal] = useState(false);

    const socket = socketIOClient(backendUrl, {
        transports: ['websocket', 'polling'], // Ensure correct transport methods
    });


    // get all todo items from db
    useEffect(() => {
        axios.post(`${backendUrl}/db`, {query: `select * from todo.shared_todos where user_id = ${userId} or from_user_id = ${userId}`}).then((resp, err) => {
            if(resp.status === 200){
                for(let shareTodo of resp.data){
                    socket.emit('joinRoom', shareTodo.room_id);
                }
            }
        })

        // Listen for updates
        socket.on('receiveTodoUpdate', (updatedTodo) => {
            console.log('your todo has been updated from your friend');
            setTodos((prevTodos) =>
                prevTodos.map((todo) =>
                    todo.id === updatedTodo.id ? updatedTodo : todo
                )
            );
        });

        socket.on('receiveTodoShare', (addTodo) => {
            console.log('you friend has shared a todo with you');
            setTodos([...todos, addTodo]);
        });

        socket.on('receiveTodoDelete', (deleteTodo) => {
            console.log(`todo ${deleteTodo.id} has been deleted by your friend`);
            setTodos((prevTodos) =>
                prevTodos.filter(todo => todo.id !== deleteTodo.id)
            );
        });

        let uid = userId;
        if(uid === -1){
            uid = parseInt(Cookies.get('userid'));
            setUserId(uid);
        }
        axios.post(`${backendUrl}/todo/get`, {userid: uid}).then((resp, err) => {
            if(resp.status === 200){
                const sortedTodos = resp.data.map(todo => ({
                    id: todo.TodoID,
                    description: todo.Description,
                    dueDate: moment(todo.DueDate).format('YYYY-MM-DD HH:mm'),
                    priority: todo.Priority
                })).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                setTodos(sortedTodos);
            }
        });

        return () => {
            socket.emit('leaveRoom', userId);
            socket.disconnect();
        };
    }, [userId, joinedRooms])

    const joinRoom = (roomId) => {
        if (!joinedRooms.includes(roomId)) {
            socket.emit('joinRoom', roomId);
            setJoinedRooms(prevRooms => [...prevRooms, roomId]);
        }
    };

    const handleShareTodo = (todoId, shareWithUserId) => {
        axios.post(`${backendUrl}/shareTodo`, { todoId, userId: shareWithUserId, fromUserId: userId })
        .then((resp) => {
            if (resp.status === 200) {
                console.log('Todo shared successfully');

                socket.emit('shareTodo', { roomId: `room-${todoId}`, todo: { id: todoId, description, priority, dueDate: dueDate ? dueDate.format('YYYY-MM-DD HH:mm') : undefined } });
                joinRoom(resp.data.roomId); // Join the newly shared todo's room
            }
        })
        .catch(err => {
            message.error('Failed to share');
            console.error('Error sharing todo:', err);
        });
    };

    const groupTasksByMonthDay = useMemo(() => {
        return todos.reduce((groups, task) => {
            const date = moment(task.dueDate).format('MM-DD'); // Format as 'Month-Day'
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(task);
            return groups;
        }, {});
    }, [todos]);

    const handleAddTodo = async () => {
        const newTodo = {
            id: -1,
            description,
            dueDate: dueDate ? dueDate.format('YYYY-MM-DD HH:mm') : undefined, // Format only if dueDate is not undefined
            priority
        };
        setDescription('');
        setDueDate(undefined); // Properly set to undefined
        setPriority('Low');
        setShowTodoDetailModal(false);
        
        // write to db
        const resp = await axios.post(`${backendUrl}/todo/add`, {description, priority, userId, dueDate: dueDate.format('YYYY-MM-DD HH:mm')});
        if(resp.status === 200){
            newTodo.id = resp.data.newId;

            setTodos([...todos, newTodo]);
        }
    };    

    const handleDeleteTodo = (id) => {
        axios.post(`${backendUrl}/todo/delete`, {todoId: id, userid: userId}).then((resp, err) => {
            if(resp.status === 200){
                message.success(`Delete success`);
                setTodos(todos.filter(todo => todo.id !== id));

                socket.emit('deleteTodo', { roomId: `room-${id}`, todo: { id: id}});
            }else{
                message.error(`Delete failed, please check console`);
                console.log(err);
            }
        })
    };

    const handleEditTodo = (item) => {
        setCurMode(MODE_EDIT);
        setShowTodoDetailModal(true);
        
        setDescription(item.description);
        setDueDate(item.dueDate ? moment(item.dueDate) : undefined);
        setPriority(item.priority);
        setEditingId(item.id);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setDescription('');
        setDueDate(undefined);
        setPriority('Low');

        setShowTodoDetailModal(false);
    }

    const handleUpdateTodo = async () => {
        await axios.post(`${backendUrl}/todo/update`, {
            description, priority, userId, dueDate: dueDate.format('YYYY-MM-DD HH:mm'), todoId: editingId
        }).then((resp, err) => {
            if(resp.status === 200){
                message.success('Update success');
                setTodos(todos.map(todo => {
                    if (todo.id === editingId) {
                        return {
                            ...todo,
                            description,
                            priority,
                            dueDate: dueDate ? dueDate.format('YYYY-MM-DD HH:mm') : undefined,
                        };
                    }
                    return todo;
                }));
                setEditingId(null);
                setDescription('');
                setDueDate(undefined);
                setPriority('Low');

                socket.emit('updateTodo', { roomId: `room-${editingId}`, todo: { id: editingId, description, priority, dueDate: dueDate ? dueDate.format('YYYY-MM-DD HH:mm') : undefined } });
        
                setShowTodoDetailModal(false);
            }else{
                message.error(`Update failed, please check console`);
                console.log(err);
            }
        })
    };

    const handleAutoCompleteSearch = (value) => {
        if(value.endsWith(' ')){
            debouncedFetchSuggestions(value);
        }
    }

    const handleAutoCompleteSelect = (value) => {
        setAutoCompOptions([]);
        setDescription(value);
    }

    const fetchSuggestions = async (val) => {
        const response = await axios.post(`${backendUrl}/predict`, {
            text: val
        });
        if(response.status === 200){
            setAutoCompOptions(response.data.result.split(" ").map(txt => 
                {
                    return {
                        label: val + txt,
                        value: val + txt
                    }
                }
            ));
        }
    }

    const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), []);

    return (
        <div>
            <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            <div>
                {groupTasksByMonthDay[selectedDate] ? groupTasksByMonthDay[selectedDate].map(todo => (
                    <TodoItem key={todo.id} item={todo} onEdit={handleEditTodo} onDelete={handleDeleteTodo} handleShareTodo={handleShareTodo} />
                )) : <div className='empty-msg-container'>Nothing for {selectedDate}</div>}
            </div>
            <Modal
                title={curMode === MODE_ADD ? "Add new todo" : "Edit todo"}
                open={showTodoDetailModal}
                okText={curMode === MODE_ADD ? "Add" : "Update"}
                cancelText={"Cancel"}
                onOk={curMode === MODE_ADD ? handleAddTodo : handleUpdateTodo}
                onCancel={handleCancelEdit}
            >
                <AutoComplete
                    options={autoCompOptions}
                    onSearch={(value) => handleAutoCompleteSearch(value)}
                    onSelect={handleAutoCompleteSelect}
                    value={description}
                    style={{
                        width: '100%'
                    }}
                >
                    <TextArea
                        type="text"
                        placeholder="Description"
                        value={description}
                        style={{width: '90%'}}
                        rows={4}
                        onChange={e => setDescription(e.target.value)}
                    />
                </AutoComplete>
                <DatePicker 
                    showTime
                    style={{
                        marginTop: 10
                    }}
                    value={dayjs(dueDate ? dueDate.format('YYYY-MM-DD HH:mm') : moment().format('YYYY-MM-DD'))}
                    onChange={(date) => setDueDate(date ? date : undefined)}
                />
                <Select 
                    defaultValue={"Low"}
                    onChange={val => setPriority(val)}
                    style={{
                        width: 100,
                        display: 'block',
                        marginTop: 10
                    }}
                    value={priority}
                    options={[
                        {
                            value: 'Low',
                            label: 'Low'
                        },
                        {
                            value: 'Medium',
                            label: 'Medium'
                        },
                        {
                            value: 'High',
                            label: 'High'
                        }
                    ]}
                />
            </Modal>
            <div className='todo-add-container'>
                <Button type='primary' onClick={() => {
                    setShowTodoDetailModal(true)
                    setDueDate(moment())
                }}
                >
                    Add Todo
                </Button>
            </div>
        </div>
    );
}

export default TodoList;
