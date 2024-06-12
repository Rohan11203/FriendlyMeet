import React,{ useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider';
import { useNavigate } from 'react-router-dom';

const  LobbyScreen = () => {

  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  // SocketProvider Hook // Created in context/SocketProvider
  const socket = useSocket();
  
  const handleSubmit = useCallback((e)=>{
    e.preventDefault();
    // Logic To Join THe Room
    socket.emit('room:join',{ email , room });
    
    },[email,room,socket]);


    const navigate = useNavigate();

    const handleJoinRoom = useCallback((data)=>{
      const { email, room } = data;
      navigate(`/room/${room}`);
    },[navigate]);


  useEffect(()=>{
    socket.on('room:join',handleJoinRoom);
    return ()=>{
      socket.off('room:join',handleJoinRoom)
    }
  },[socket,handleJoinRoom]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Join RooM For Video Call</h1>
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
        <div className="mb-4">
          <label htmlFor='email' className="block text-gray-700">Email :</label>
          <input id='email' type='email' value={email} onChange={(e)=> setEmail(e.target.value)} className="mt-1 p-2 border rounded-md w-full"/>
        </div>
        <div className="mb-4">
          <label htmlFor='room' className="block text-gray-700">RoomId :</label>
          <input id='room' type='room' value={room} onChange={(e)=> setRoom(e.target.value)} className="mt-1 p-2 border rounded-md w-full"/>
        </div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">Join</button>
      </form>
    </div>

    
  </div>
  

  )
}

export default LobbyScreen;