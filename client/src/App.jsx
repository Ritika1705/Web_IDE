import Terminal from "./components/terminal"
import "./App.css"
import { useEffect, useState } from "react";
import FileTree from "./components/tree";
import socket from "./socket";

function App() {

  const[fileTree, setFileTree] = useState({});

  const getFileTree = async() => {
    const response =  await fetch('http://localhost:9000/files')
    const result = await response.json()
    setFileTree(result.tree);
  };

  useEffect(() => {
    getFileTree();
  },[]);

  useEffect(() => {
    socket.on("file:refresh", getFileTree);
    return () => {
      socket.off("file:refresh", getFileTree);
    };
  }, []);

  return (
    <>
      <div className="playground-container">
        <div className="editor-container">
          <div className="files">
            <FileTree tree={fileTree}/>
          </div>
          <div className="editor"></div>
        </div>
        <div className="terminal-container">
          <Terminal/>
        </div>
      </div>
    </>
  )
}

export default App
