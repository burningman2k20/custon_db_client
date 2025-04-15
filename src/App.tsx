import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import Collections from './components/Collections';
import Items from './components/Items';

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import Collections from "./components/Collections";
// import CollectionDetail from "./components/CollectionDetail";
import EditDocument from './components/EditDocument';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { Home } from './components/Home';
import FileManager from './components/FileManager';
import NewCollectionDetail from './components/NewCollectionDetail';
import CollectionDetail2 from './components/CollectionDetail2';
import { Dashboard } from './components/dashboard';
import CollectionDetail from './components/CollectionDetail3';
import { Profile } from './components/Profile';
import { DocumentsList } from './components/DocumentsList';
import { DocumentView } from './components/DocumentView';
import { CollectionWrapper } from './components/CollectionWrapper';
import Search from './components/Search';

const App = () => {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);



  return (
    <Router>
      <AuthProvider>
        <Navbar />
        {/* Sticky Navbar */}
        {/* <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow">
          <div className="container-fluid">
            <a className="navbar-brand" href="/">
              Custom Rest API Database
            </a>
            /* <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button> */

            /* <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link" href="/">
                    Collections
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/login">
                    Login
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/signup">
                    Sign Up
                  </a>

                </li>
              </ul>
            </div> *

          </div>
        </nav> */}

        <div className="p-6 max-w-3xl mx-auto">
          {/* <h1 className="text-2xl font-bold mb-4">React Collections App</h1> */}
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/collections/:collectionName" element={
              <ProtectedRoute>
                <CollectionDetail2 />
              </ProtectedRoute>
            } /> */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            {/* <Route path="/collections/:name/:name2/:name3" element={
              <ProtectedRoute>
                <CollectionDetail />
              </ProtectedRoute>
            } /> */}
            <Route path="/search" element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            } />
            <Route path="/storage" element={
              <ProtectedRoute>
                <FileManager />
              </ProtectedRoute>
            } />
            <Route path="/collections" element={
              <ProtectedRoute>
                <Collections />
              </ProtectedRoute>
            } />
            {/* <Route path="/collections/:name/documents/:docId" element={
              <ProtectedRoute>
                <EditDocument />
              </ProtectedRoute>
            } /> */}

            {/* Route for collections and subcollections */}
            <Route path="/collections/:collectionName/*" element={
              <ProtectedRoute>
                {/* <CollectionDetail />
                 */}
                <DocumentsList />
              </ProtectedRoute>}
            />

            {/* Route for collections and subcollections */}
            <Route path="/:collectionName/document/:documentName/*" element={
              <ProtectedRoute>
                {/* <CollectionDetail />
                 */}
                <DocumentView />
              </ProtectedRoute>}
            />

            {/* Route for arrays inside a collection */}
            {/* <Route path="/collections/:collectionPath/arrays/:arrayName" element={<NewCollectionDetail viewArray={(arr) => <div>{arr.join(", ")}</div>} />} /> */}

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
    // <Container>
    //   <Collections />
    //   {selectedCollection && <Items collectionName={selectedCollection} />}
    // </Container>
  );
};

export default App;
