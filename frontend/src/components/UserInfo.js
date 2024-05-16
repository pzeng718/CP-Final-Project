import { UserOutlined } from '@ant-design/icons'
import { Button, Dropdown } from 'antd';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

function UserInfo({}){
    const [uid, setUid] = useState(-1);
    useEffect(() => {
        let userid = parseInt(Cookies.get('userid'));
        setUid(userid);
    }, [])

    const handleSignOut = () => {
        const allCookies = Cookies.get();
        for (const cookie in allCookies) {
            Cookies.remove(cookie, { path: '/' });
        }
        window.location.reload();
    }

    const items = [
        {
            key: '1',
            label: (
                <Button type='primary' onClick={handleSignOut}>Sign Out</Button>
            )
        }
    ]
    return <div className="uinfo-container">
        <Dropdown
            menu={{items}}
        >
            <div>
                <UserOutlined style={{fontSize: '2rem'}} />
                <span>uid: {uid}</span>
            </div>
        </Dropdown>
    </div>
}

export default UserInfo;