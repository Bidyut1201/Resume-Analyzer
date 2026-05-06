import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react'

const Protected = ({children}) => {
    const { loading,user } = useAuth()
    

    if(loading){
        return (
            <main style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <h1>Loading......</h1>
            </main>
        )
    }

    if(!user){
       return <Navigate to={'/'} />
    }

    return children
}

export default Protected