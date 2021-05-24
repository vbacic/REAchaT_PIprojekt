import React, { useEffect, useRef, useState } from 'react';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyCDBIM0J5ERhEaVQsuf5nsHjggFdex9BPg",
  authDomain: "reachat-5190b.firebaseapp.com",
  projectId: "reachat-5190b",
  storageBucket: "reachat-5190b.appspot.com",
  messagingSenderId: "970056032176",
  appId: "1:970056032176:web:abf4131aea4d47efa14075",
  measurementId: "G-2CCV86GMP2"

})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App border-bg h-screen">
      <SignOut />
      <section className="flex justify-center items-center h-screen">
        {user ? <Razgovori /> : <SignIn />}
      </section>
    </div>
  );
}


function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <button className="mt-auto bg-white outline-none focus:outline-none p-2 m-3 border-b-4 border-gray-500 hover:bg-gray-200 hover:border-gray-500 transition-all duration-75 ease-in-out rounded inline-flex items-center" onClick={signInWithGoogle}>
        <img className="w-5 mr-2 block" src={process.env.PUBLIC_URL + '/google-icon.svg'} alt='Google Icon' />
        <span className="block">Ulogiraj se sa Google računom</span>
      </button>
      <p className="text-white text-opacity-50 text-center hover:text-opacity-100 text-sm">REAchaT :D </p>
      <p className="justify-self-end mt-auto text-white text-center text-opacity-50 hover:text-opacity-100">Izradile: Mattea i Valentina</p>
    </div>
  )
}

function SignOut() {
  return auth.currentUser && (
    <div className="w-full">
      <button className="absolute hover:shadow-xl hover:text-pink-900 transition-all duration-75 ease-in-out rounded-full p-2 bg-white signout-btn material-icons" onClick={() => auth.signOut()}>Logout</button>
    </div>
  )
}

function Razgovori() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt', 'asc').limitToLast(100);

  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');

  const scrollToBottom = () => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const { displayName, uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      user: displayName,
      body: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: uid,
      photoURL: photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="chat-bg w-full sm:w-2/3 p-2 rounded">
      <div className="overflow-y-auto h-screen-90">
        {messages && messages.map(msg => <Poruka key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </div>

      <form onSubmit={sendMessage} className="pt-3 w-full inline-flex">
        <input className="rounded-3xl px-3 w-full py-1 outline-none focus:shadow" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Napiši poruku..." />
        <button className={`material-icons p-2 mx-2 bg-white rounded-full transition-all duration-75 ease-in-out text-xl ${!formValue || 'text-pink-700 hover:text-pink-900'}`} type="submit" disabled={!formValue}>Pošalji</button>
      </form>
    </div>
  )
}

function Poruka(props) {
  const { user, body, uid, photoURL, createdAt } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'flex-row-reverse' : 'flex-row';
  const messageBodyClass = uid === auth.currentUser.uid ? 'sent-message-bg text-right' : 'received-message-bg';
  const imageClass = uid === auth.currentUser.uid ? 'ml-2' : 'mr-2';

    return (
      <div className={`px-3 py-2 flex no-wrap items-start ${messageClass}`}>
        <div>
          <img className={`block rounded-full object-cover w-10 ${imageClass}`} src={photoURL || 'https://i.imgur.com/rFbS5ms.png'} alt="{user}'s pfp" />
        </div>
        <div className={`block w-80 break-words p-2 rounded-md ${messageBodyClass}`}>
          <p className="text-xs">{user}</p>
          <p>{body}</p>
        </div>
      </div>
  )
}

export default App;
