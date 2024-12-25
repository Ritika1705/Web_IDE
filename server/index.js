const http = require('http');
const express = require('express');
const fs = require('fs/promises');
const { Server: SocketServer } = require('socket.io');
const path = require('path');
const cors = require('cors');
const chokidar = require('chokidar');
const pty = require('node-pty');

const ptyProcess = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: path.resolve(__dirname, "user"),
    env: process.env
});

const app = express();
const server = http.createServer(app);
const io = new SocketServer({
    cors: '*'
});

app.use(cors());

io.attach(server);

chokidar.watch('./user').on('all', (event, path) => {
    io.emit('file:refresh', path);
});

ptyProcess.onData(data => {
    io.emit('terminal:data', data);
});

io.on('connection', (socket) => {
    console.log(`Socket connected`, socket.id);
    console.log("INIT_CWD:", __dirname);

    socket.emit('file:refresh');

    socket.on('file:change', async ({ path, content }) => {
        await fs.writeFile(`./user${path}`, content);
    });

    socket.on('terminal:write', (data) => {
        console.log('Term', data);
        ptyProcess.write(data);
    });
});

app.get('/files', async (req, res) => {
    const fileTree = await generateFileTree('./user');
    return res.json({ tree: fileTree });
});

app.get('/files/content', async (req, res) => {
    const filePath = req.query.path;
    const content = await fs.readFile(`./user${filePath}`, 'utf-8');
    return res.json({ content });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/client/dist')));
}

// Dynamically bind to the port provided by Render
server.listen(process.env.PORT || 9000, () => {
    console.log(`🐳 Docker server running on port ${process.env.PORT || 9000}`);
});

async function generateFileTree(directory) {
    const tree = {};

    async function buildTree(currentDir, currentTree) {
        const files = await fs.readdir(currentDir);

        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const stat = await fs.stat(filePath);

            if (stat.isDirectory()) {
                currentTree[file] = {};
                await buildTree(filePath, currentTree[file]);
            } else {
                currentTree[file] = null;
            }
        }
    }

    await buildTree(directory, tree);
    return tree;
}
