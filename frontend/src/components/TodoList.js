import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import TodoItem from './TodoItem';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { AutoComplete, Button, DatePicker, Input, Modal, Select, message } from 'antd';
const { TextArea } = Input;

const dbUrl = 'http://localhost:3000/db';

function TodoList() {
    const MODE_ADD = 1;
    const MODE_EDIT = 2;
    const [curMode, setCurMode] = useState(1);
    const [todos, setTodos] = useState([]);
    const [autoCompOptions, setAutoCompOptions] = useState([]);
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(moment());
    const [priority, setPriority] = useState('Low');
    const [editingId, setEditingId] = useState(null); 
    const [showTodoDetailModal, setShowTodoDetailModal] = useState(false);

    // get all todo items from db
    useEffect(() => {
        axios.post(dbUrl, {query: 'select * from todo.todoitem;'}).then((resp, err) => {
            if(resp.status === 200){
                setTodos(resp.data.map(todo => {
                    return {
                        id: todo.TodoID,
                        description: todo.Description,
                        dueDate: moment(todo.DueDate).format('YYYY-MM-DD HH:mm'),
                        priority: todo.Priority
                    }
                }))
            }
        });
    }, [])

    const handleAddTodo = async () => {
        const newTodo = {
            id: Date.now(),
            description,
            dueDate: dueDate ? dueDate.format('YYYY-MM-DD HH:mm') : undefined, // Format only if dueDate is not undefined
            priority
        };
        setTodos([...todos, newTodo]);
        setDescription('');
        setDueDate(undefined); // Properly set to undefined
        setPriority('Low');
        setShowTodoDetailModal(false);

        // write to db
        const resp = await axios.post(dbUrl, {
            query: `insert into todo.todoitem(Description, DueDate, Priority) values("${description}", "${dueDate.format('YYYY-MM-DD HH:mm')}", "${priority}");`
        });
        if(resp.status === 200){
            console.log(resp);
        }
    };    

    const handleDeleteTodo = (id) => {
        axios.post(dbUrl, {
            query: `delete from todo.todoitem where todoid = ${id};`
        }).then((resp, err) => {
            if(resp.status === 200){
                message.success(`Delete success`);
                setTodos(todos.filter(todo => todo.id !== id));
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
        await axios.post(dbUrl, {
            query: `update todo.todoitem set Description = "${description}", Priority = "${priority}", DueDate = "${dueDate.format('YYYY-MM-DD HH:mm')}" where todoid = ${editingId};`
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
        const response = await axios.post('http://localhost:3000/predict', {
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
            {todos.map(todo => (
                <TodoItem key={todo.id} item={todo} onEdit={handleEditTodo} onDelete={handleDeleteTodo} />
            ))}
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
                <Button type='primary' onClick={() => setShowTodoDetailModal(true)}>Add Todo</Button>
            </div>
        </div>
    );
}

export default TodoList;
