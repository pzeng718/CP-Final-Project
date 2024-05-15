import React, { useState } from 'react';
import axios from 'axios';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { message, Button, Form, Input, Checkbox } from 'antd';

function AuthForm({setAuth}) {
    const [isLogin, setIsLogin] = useState(true);

    const onFinish = async (values) => {
        let {username, password} = values;
        const url = `http://cppart2-web-1295080897.us-east-2.elb.amazonaws.com:3000/${isLogin ? 'login' : 'signup'}`;
        try {
            const response = await axios.post(url, { username, password }, { withCredentials: true });
            console.log('Response:', response.data);
            message.success(`${isLogin ? 'Login' : 'Signup'} success`);
            setAuth(true);
        } catch (error) {
            message.error(`${isLogin ? 'Login' : 'Signup'} failed`);
            setAuth(false)
        }
    }

    return (
        <div className='login-container'>
            <Form
                name="normal_login"
                className="login-form"
                initialValues={{
                    remember: true,
                }}
                onFinish={onFinish}
            >
                <Form.Item
                    name="username"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your Username!',
                    },
                    ]}
                >
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your Password!',
                    },
                    ]}
                >
                    <Input
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        type="password"
                        placeholder="Password"
                    />
                </Form.Item>
                <Form.Item>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Remember me</Checkbox>
                    </Form.Item>
                </Form.Item>
            
                <Form.Item>
                    <Button style={{marginRight: '10px'}} type="primary" htmlType="submit" className="login-form-button">
                    Log in
                    </Button>
                    Or <Button style={{marginLeft: "10px"}} type="primary" htmlType="submit" onClick={() => setIsLogin(false)}>Sign up</Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default AuthForm;