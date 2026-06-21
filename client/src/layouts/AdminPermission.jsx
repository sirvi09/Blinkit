import React from 'react'
import { useSelector } from 'react-redux'

const AdminPermission = ({children}) => {
    const user = useSelector(state => state.user)
  return (
    <div>
      <>
         {
           user.role === "ADMIN"
            ? children : <p className='text-red-600 bg-red-100 p-4 '>Do not have permission </p>
         }
      </>
    </div>
  )
}

export default AdminPermission
