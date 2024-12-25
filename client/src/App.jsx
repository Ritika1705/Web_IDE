import Terminal from "./components/terminal"
import "./App.css"
import { useCallback, useEffect, useState } from "react";
import FileTree from "./components/tree";
import socket from "./socket";
import AceEditor from "react-ace";
import dotenv from "dotenv"
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/ext-language_tools";


function App() {

  const[fileTree, setFileTree] = useState({});
  const[selectedFile, setSelectedFile] = useState('');
  const[selectedFileContent, setSelectedFileContent] = useState('');
  const[code, setCode] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;

  const isSaved = selectedFileContent === code;
  

  const getFileTree = async() => {
    const response =  await fetch(`${apiUrl}/files`);
    const result = await response.json()
    setFileTree(result.tree);
  };

  const getFileContents = useCallback(async () => {
      if(!selectedFile) return;
      const response =  await fetch(
        `${apiUrl}/files/content?path=${selectedFile}`
      );
      const result = await response.json();
      setSelectedFileContent(result.content);
  }, [selectedFile, apiUrl]);

  useEffect(() => {
    if(selectedFile) getFileContents();
  }, [getFileContents, selectedFile]);

  useEffect(() => {
    getFileTree();
  },[]);

  useEffect(() => {
    socket.on("file:refresh", getFileTree);
    return () => {
      socket.off("file:refresh", getFileTree);
    };
  }, []);

  useEffect(() => {
    if(selectedFile && selectedFileContent){
      setCode(selectedFileContent);
    }
  },[selectedFile, selectedFileContent]);

  useEffect(() => {
    if(code && !isSaved) {
      const timer = setTimeout(() => {
        socket.emit("file:change", {
          path: selectedFile,
          content: code,
        });
      }, 5*1000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [code, isSaved, selectedFile]); 

  useEffect(() => {
    setCode("");
  },[selectedFile ])

  return (
    <>
      <div className="playground-container">
        <div className="editor-container">
          <div className="files">
            <FileTree 
              onSelect={(path) => setSelectedFile(path)}
              tree={fileTree}
            />
          </div>
          <div className="editor">
            {selectedFile && 
            <p>
              {selectedFile.replaceAll('/', ' > ')}
              {isSaved ? "  Saved " : " Unsaved "}
            </p>}
            <AceEditor
              onChange={(e) => setCode(e)}
              placeholder="Start typing your code here..."
              mode="javascript"
              theme="twilight"
              name="editor"
              fontSize={18}
              lineHeight={19}
              showPrintMargin={true}
              showGutter={true}
              highlightActiveLine={true}
              value={code}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: false,
                enableMobileMenu: true,
                showLineNumbers: true,
                tabSize: 2,
              }}
              style={{
                width: "100%", // Covers the full width of the page
                height: "60vh"
              }}
          />
          </div>
        </div>
        <div className="terminal-container">
          <div className="terminal-header">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <Terminal />
        </div>
      </div>
    </>
  )
}

export default App
