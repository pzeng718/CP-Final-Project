import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

function TodoItem({ item, onEdit, onDelete }) {
    return (
        <div style={{ margin: '10px', padding: '10px', border: '1px solid #ccc' }}>
            <p>Description: {item.description}</p>
            <p>Due Date: {item.dueDate}</p>
            <p>Priority: {item.priority}</p>
            <Button className='btn-margin' type='primary' onClick={() => onEdit(item)}>Edit</Button>
            <Button className='btn-margin' type='primary' onClick={() => onDelete(item.id)}>Delete</Button>
        </div>
    );
}

TodoItem.propTypes = {
    item: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default TodoItem;
