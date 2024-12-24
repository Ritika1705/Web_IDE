const FileTreeNode = ({ fileName, nodes, onSelect, path }) => {
    const isDir = !!nodes;
  
    return (
      <div
        className={`file-tree-node ${isDir ? "directory" : "file"}`}
        onClick={(e) => {
          e.stopPropagation();
          if (isDir) return;
          onSelect(path);
        }}
      >
        <p className={`node-name ${!isDir ? "file-name" : ""}`}>{fileName}</p>
        {nodes && fileName !== "node_modules" && (
          <ul className="children">
            {Object.keys(nodes).map((child) => (
              <li key={child} className="child">
                <FileTreeNode
                  onSelect={onSelect}
                  path={path + "/" + child}
                  fileName={child}
                  nodes={nodes[child]}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  const FileTree = ({ tree, onSelect }) => {
    return (
      <div className="file-tree">
        <FileTreeNode onSelect={onSelect} fileName="/" path="" nodes={tree} />
      </div>
    );
  };
  
  export default FileTree;
  