import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import Chat from "./Chat";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="flex flex-col lg:flex-row justify-center items-start h-screen">
    {/* Left Column (Video) */}
    <div className="w-full lg:w-1/3 mb-4 lg:mb-0">
      <div className="text-center">
        {myStream && (
          <div className="mt-8">
            <h1 className="text-xl font-bold mb-2">My Stream</h1>
            <div className="aspect-w-16 aspect-h-9">
              <ReactPlayer
                playing
                muted
                className="rounded-lg"
                url={myStream}
              />
            </div>
          </div>
        )}
        {remoteStream && (
          <div className="mt-8">
            <h1 className="text-xl font-bold mb-2">Remote Stream</h1>
            <div className="aspect-w-16 aspect-h-9">
              <ReactPlayer
                playing
                muted
                className="rounded-lg"
                url={remoteStream}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  
    {/* Middle Column (Buttons) */}
    <div className="w-full lg:w-1/3 mb-4 lg:mb-0">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Room Page</h1>
        <h4 className="mb-4">{remoteSocketId ? "Connected" : "No one in room"}</h4>
        {myStream && <button onClick={sendStreams} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">Send Stream</button>}
        {remoteSocketId && <button onClick={handleCallUser} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">CALL</button>}
      </div>
    </div>
  
    {/* Right Column (Chat) */}
    <div className="w-full lg:w-1/3">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">Chat Section</h2>
        {/* Add your chat component here */}
        {
          myStream && (
            <Chat socket={socket} room={remoteSocketId} />
          )
        }
      </div>
    </div>
  </div>
  


  );
};

export default RoomPage;