import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Profile.css'
import { urlConfig } from '../../config'
import { useAppContext } from '../../context/AppContext'

const Profile = () => {
  const [userDetails, setUserDetails] = useState({ name: '', email: '' })
  const [updatedDetails, setUpdatedDetails] = useState({ name: '', email: '' })
  const { setUserName } = useAppContext()
  const [changed, setChanged] = useState('')
  const [editMode, setEditMode] = useState(false)
  const navigate = useNavigate()

  const fetchUserProfile = useCallback(() => {
    try {
      const authtoken = sessionStorage.getItem('auth-token')
      const email = sessionStorage.getItem('email')
      const name = sessionStorage.getItem('name')

      if (authtoken && (name || email)) {
        const storedUserDetails = {
          name: name || '',
          email: email || ''
        }

        setUserDetails(storedUserDetails)
        setUpdatedDetails(storedUserDetails)
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    const authtoken = sessionStorage.getItem('auth-token')

    if (!authtoken) {
      navigate('/app/login')
      return
    }

    fetchUserProfile()
  }, [fetchUserProfile, navigate])

  const handleEdit = () => {
    setEditMode(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setUpdatedDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const authtoken = sessionStorage.getItem('auth-token')
      const email = sessionStorage.getItem('email')

      if (!authtoken || !email) {
        navigate('/app/login')
        return
      }

      const payload = { ...updatedDetails }
      const response = await fetch(`${urlConfig.backendUrl}/api/auth/update`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authtoken}`,
          'Content-Type': 'application/json',
          Email: email
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      sessionStorage.setItem('name', updatedDetails.name)
      setUserDetails(updatedDetails)
      setEditMode(false)
      setUserName(updatedDetails.name)
      setChanged('Name Changed Successfully!')

      setTimeout(() => {
        setChanged('')
        navigate('/')
      }, 1000)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="profile-container">
      {
        editMode
          ? (
            <form onSubmit={handleSubmit}>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={userDetails.email}
                  disabled
                />
              </label>

              <label>
                Name
                <input
                  type="text"
                  name="name"
                  value={updatedDetails.name}
                  onChange={handleInputChange}
                />
              </label>

              <button type="submit">Save</button>
            </form>
            )
          : (
            <div className="profile-details">
              <h1>Hi, {userDetails.name}</h1>
              <p>
                <b>Email:</b> {userDetails.email}
              </p>
              <button onClick={handleEdit}>Edit</button>
              <span
                style={{
                  color: 'green',
                  height: '.5cm',
                  display: 'block',
                  fontStyle: 'italic',
                  fontSize: '12px'
                }}
              >
                {changed}
              </span>
            </div>
            )
      }
    </div>
  )
}

export default Profile
