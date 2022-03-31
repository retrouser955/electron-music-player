const { app, BrowserWindow } = require('electron');
const path = require('path');
const RPC = require('discord-rpc')
RPC.register('955818281078497320');
const client = new RPC.Client({ transport: 'ipc' });
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}
const fs = require('fs')
let songName;
let files = []
const songFiles = fs.readdirSync(`${__dirname}/songs`).filter(file => file.endsWith('.mp3'))
let amountOfFiles = fs.readdirSync(`${__dirname}/songs`).length
amountOfFiles = Number(amountOfFiles)
function textReplace(haystack, needle, replacement) {
    needle = needle.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08");
    return haystack.replace(new RegExp(needle, 'g'), replacement);
}
for(const songs of songFiles) {
    console.log(songs)
    let songDisplayName;
    songDisplayName = textReplace(songs, '.mp3', '')
    songDisplayName = textReplace(songDisplayName, '_', ' ')
    files.push({
        name: `${__dirname}/songs/${songs}`,
        thumbnail: `${__dirname}/image/record.png`,
        displayName: `${songDisplayName}`
    })
    console.log(songDisplayName)
}
const Store = require('electron-store')
const store = new Store()
store.set('files', files)
const events = require('events');
const eventEmitter = new events.EventEmitter()
let mainWindow;
const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 630,
    height: 410,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: `${__dirname}/images/retro-player.png`
  });
  store.set('songName', 'Music Idle')
  store.set('songState', ['Paused', 'pause'])
  mainWindow.setResizable(false)
  
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
async function setActivity() {
  if (!client || !mainWindow) {
    return;
  }
  songName = store.get('songName')
  let songState = store.get('songState')
  mainWindow.webContents
  client.setActivity({
      details: songName || "Music Idle",
      state: 'Listening',
      largeImageKey: 'retro_player_530x530',
      largeImageText: 'Retro Player 1.3.0',
      smallImageKey: songState[1],
      smallImageText: songState[0],
      buttons: [
        {
            label: "Github Repo",
            url: "https://github.com/retrouser955/electron-music-player"
        }
      ]
  });
}
client.on('ready', () => {
  setActivity();
  setInterval(() => {
    setActivity();
  }, 15e3);
});
let clientId = '955818281078497320'
store.set('error', false)
client.login({ clientId }).catch(e => {
  store.set('error', true)
});
