# pyromasters-mp

This is **pyromasters-mp**, a multiplayer game inspired from the old game Pyromasters available on MoFunZone.com since 2006!

The site https://pyro.ezluci.com/ should be running right now.

![pyro](https://github.com/user-attachments/assets/3d5ac35e-e107-4097-9dd4-3cb84d0b303a)

## Local installation

After you cloned the repository, do `npm install` to install all the required packages.

Go in the `./socket_server` folder, and run `npx tsc` in order to compile the socket-server. You can now start this server with `node dist/socket-server.js`.

Now go in the `./web` folder, and run `npx vite build` in order to build the client files. Also, run `go build` to compile the web-server. You can now start this server with `./web-server`.

You can change all the ports to whatever you want by editing the files `.env` and `web/src/game-socket.ts`. That's it.