const FileTreeNode = ({fileName, nodes}) => {
    const isDir = !!nodes;
    return (
        <div>
            <div style={{marginLeft: "10px"}}>
                <p className={isDir ? "file-node" : ""}>{fileName}</p>
                {nodes && <ul>
                    {Object.keys(nodes).map(child =>(
                        <li key={child}>
                            <FileTreeNode fileName={child} nodes={nodes[child]}/>
                        </li>
                    ))}
                    </ul>}
            </div>
        </div>
    )
}

const FileTree = ({tree}) => {
    return (
        <FileTreeNode fileName="/" nodes={tree}/>
    )
};

export default FileTree