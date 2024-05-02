import React, { useState } from 'react';
import TodoItem from './TodoItem';
import moment from 'moment';
import { Button, DatePicker, Input, Modal, Select } from 'antd';
const { TextArea } = Input;

function TodoList() {
    const MODE_ADD = 1;
    const MODE_EDIT = 2;
    const [curMode, setCurMode] = useState(1);
    const [todos, setTodos] = useState([]);
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState();
    const [priority, setPriority] = useState('low');
    const [editingId, setEditingId] = useState(null); 
    const [showTodoDetailModal, setShowTodoDetailModal] = useState(false);

    const handleAddTodo = () => {
        const newTodo = {
            id: Date.now(),
            description,
            dueDate: dueDate ? dueDate.format('YYYY-MM-DD HH:mm') : undefined, // Format only if dueDate is not undefined
            priority
        };
        setTodos([...todos, newTodo]);
        setDescription('');
        setDueDate(undefined); // Properly set to undefined
        setPriority('low');
        setShowTodoDetailModal(false);
    };    

    const handleDeleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
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
        setPriority('low');

        setShowTodoDetailModal(false);
    }

    const handleUpdateTodo = () => {
        setTodos(todos.map(todo => {
            if (todo.id === editingId) {
                return {
                    ...todo,
                    description,
                    dueDate,
                    priority
                };
            }
            return todo;
        }));
        setEditingId(null);
        setDescription('');
        setDueDate(undefined);
        setPriority('low');

        setShowTodoDetailModal(false);
    };

    return (
        <div>
            {todos.map(todo => (
                <TodoItem key={todo.id} item={todo} onEdit={handleEditTodo} onDelete={handleDeleteTodo} />
            ))}
            <Modal
                open={showTodoDetailModal}
                okText={curMode === MODE_ADD ? "Add" : "Update"}
                cancelText={"Cancel"}
                onOk={curMode === MODE_ADD ? handleAddTodo : handleUpdateTodo}
                onCancel={handleCancelEdit}
            >
                <TextArea
                    type="text"
                    placeholder="Description"
                    value={description}
                    style={{width: '90%'}}
                    rows={4}
                    onChange={e => setDescription(e.target.value)}
                />
                <DatePicker 
                    showTime
                    style={{
                        marginTop: 10
                    }}
                    value={dueDate}
                    onChange={(date, dateStr) => setDueDate(date ? moment(dateStr) : undefined)}
                />
                <Select 
                    defaultValue={"low"}
                    onChange={val => setPriority(val)}
                    style={{
                        width: 100,
                        display: 'block',
                        marginTop: 10
                    }}
                    value={priority}
                    options={[
                        {
                            value: 'low',
                            label: 'low'
                        },
                        {
                            value: 'medium',
                            label: 'medium'
                        },
                        {
                            value: 'high',
                            label: 'high'
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
