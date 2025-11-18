import React from 'react'
import { useParams } from 'react-router-dom';
import { useGetUserByIdQuery } from '../../redux/services/userApi';

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, isError } = useGetUserByIdQuery(id!);

  if (isLoading) return <p>Loading user...</p>;
  if (isError || !user) return <p>User not found.</p>;

  return (
    <div>
      <h1>{user.full_name}</h1>
      <p>{user.email}</p>
      <p>{user.phone_number}</p>
      <p>{user.position}</p>
      <p>{user.institute?.name}</p>
      <p>{user.hierarchyNode?.name}</p>
    </div>
  )
}

export default UserDetail