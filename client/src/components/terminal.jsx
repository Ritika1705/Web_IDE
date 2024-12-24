import { Terminal as XTerminal } from "@xterm/xterm";
import { FitAddon } from '@xterm/addon-fit';
import { useEffect, useRef } from "react";
import socket from "../socket";

import "@xterm/xterm/css/xterm.css";

const Terminal = () => {
  const terminalRef = useRef();
  const isRendered = useRef(false);

  useEffect(() => {
    if (isRendered.current) return;
    isRendered.current = true;

    const term = new XTerminal({
        rows: 20,
        theme: {
            background: "#1e1e1e", // Dark background
            foreground: "#d4d4d4", // Light text
            cursor: "#10b981", // Green cursor
            selection: "rgba(16, 185, 129, 0.3)", // Green selection
        },
        cursorBlink: true,
    });

    const fitaddon = new FitAddon();
    term.loadAddon(fitaddon);

    term.open(terminalRef.current);

    // Fit the terminal to the container's size
    fitaddon.fit();

    // Refit on window resize
    window.addEventListener("resize", fitaddon.fit);

    term.onData((data) => {
      socket.emit("terminal:write", data);
    });

    function onTerminalData(data) {
      console.log("onTerminalData", data);
      term.write(data);
    }

    socket.on("terminal:data", onTerminalData);
  }, []);

  return <div ref={terminalRef} id="terminal" style={{ width: "100%", height: "100%" }}  />;
};

export default Terminal;