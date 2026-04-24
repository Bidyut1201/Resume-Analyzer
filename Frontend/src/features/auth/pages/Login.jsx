import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

     const { user } = useAuth()  

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {                 
        if (!loading && user) {
            navigate('/home', { replace: true })
        }
    }, [user, loading])

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin({ email, password })
        navigate('/home',{replace: true})
    }

    if (loading) {
        return (<main className='auth-main'><h1>Loading........</h1></main>)
    }

    return (
        <main className='auth-main'>
            <div className='auth-glow auth-glow--left' />
            <div className='auth-glow auth-glow--right' />

            <div className='auth-card'>
                <div className='auth-card__header'>
                    <h1>Welcome back</h1>
                    <p>Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className='auth-input-group'>
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email"
                            id='email'
                            name='email'
                            placeholder='you@example.com'
                        />
                    </div>
                    <div className='auth-input-group'>
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password"
                            id='password'
                            name='password'
                            placeholder='••••••••'
                        />
                    </div>
                    <button className='auth-btn' type='submit'>Login</button>
                </form>

                <p className='auth-card__footer'>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </main>
    )
}

export default Login
