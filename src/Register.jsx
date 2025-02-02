// make sure that the passwords match
// send the user an email link to validate the registration
// toggle if user wants password to be shown or not 
// read the post request from the form to create a temporary user in the database, using Node backend

// add a pop-up window to notify that the user has been added and send an email afterwards
import {useState} from 'react'
import './Register.css'


export default function Register(){

    const [userInfo, setUserInfo] = useState({userName: "", password : "", con_psw  : "", email: ""})
    const [formSubmitted,setFormSubmitted] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormSubmitted(true)
        const timestamp = Math.floor(Date.now() / 1000)
        console.log("User Submission Request, Submitted at " + timestamp)
        const response = await fetch('http://localhost:5000/HandleRegistration', {
            method: 'POST',
            headers: {'Content-Type': "application/json"},
            body: JSON.stringify(userInfo)
        })

    }

    return (
        <div className="form-body">
            <h2> Start your Journey! </h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="userName"> User Name: </label>
                    <input
                        type="text"
                        onChange={(e) => setUserInfo({ ...userInfo, userName: e.target.value })}
                        value={userInfo.userName}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password"> Password: </label>
                    <input
                        type="password"
                        onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
                        value={userInfo.password}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword"> Confirm Password: </label>
                    <input
                        type="password"
                        onChange={(e) => setUserInfo({ ...userInfo, con_psw: e.target.value })}
                        value={userInfo.con_psw}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email"> Email: </label>
                    <input
                        type="text"
                        onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                        value={userInfo.email}
                    />
                </div>
                <button type="submit"> Register </button>
            </form>
        </div>
    );


}
