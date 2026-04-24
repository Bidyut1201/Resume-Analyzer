import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import "../auth.form.scss"

const Register = () => {

    const navigate = useNavigate()
    const { user} = useAuth()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const { loading, handleRegister } = useAuth()
    
    useEffect(() => {
        if (!loading && user) {
            navigate('/home', { replace: true })
        }
    }, [user, loading])

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleRegister({ username, email, password })
        navigate("/login", {replace: true})
    }

    if (loading) {
        return (<main className='auth-main'><h1>Loading......</h1></main>)
    }

    return (
        <main className='auth-main'>
            <div className='auth-glow auth-glow--left' />
            <div className='auth-glow auth-glow--right' />

            <div className='auth-card'>
                <div className='auth-card__header'>
                    <h1>Create an account</h1>
                    <p>Sign up to start your interview preparation</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className='auth-input-group'>
                        <label htmlFor="username">Name</label>
                        <input
                            onChange={(e) => { setUsername(e.target.value) }}
                            type="text"
                            id='username'
                            name='username'
                            placeholder='Your name'
                        />
                    </div>
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
                    <button className='auth-btn' type='submit'>Create account</button>
                </form>

                <p className='auth-card__footer'>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </main>
    )
}

export default Register