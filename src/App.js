import { useState } from 'react';
import { View } from './pages/View';
import { Control } from './pages/Control'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";

import 'bootstrap/dist/css/bootstrap.min.css';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxaqTCa_0NCA1prOgSRw3K5Ys2vFhyUtI",
  authDomain: "nu-source-control.firebaseapp.com",
  databaseURL: "https://nu-source-control-default-rtdb.firebaseio.com",
  projectId: "nu-source-control",
  storageBucket: "nu-source-control.appspot.com",
  messagingSenderId: "794996850786",
  appId: "1:794996850786:web:000b782a61384ea3fd113b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getDatabase(app);
export { database }

function App() {
  return (
    <BrowserRouter >
      <Routes>
        <Route path="/" exact element={<View />} />
        <Route path="/admin" exact element={<Control />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;