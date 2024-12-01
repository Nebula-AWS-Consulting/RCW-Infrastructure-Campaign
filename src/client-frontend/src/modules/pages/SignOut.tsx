import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setLogout } from '../ducks/userSlice';
import { useNavigate } from 'react-router-dom';

function SignOut() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch(setLogout());
        navigate('/');
    }, [dispatch]);

    return <div></div>;
}

export default SignOut;