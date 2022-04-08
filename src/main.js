const { bbLogin, BestBuySignIn } = require('./server/pup.js');
const { BrowserWindow, app } = require('electron');
const path = require('path');
const fs = require('fs');
const fileName = './db.json'
const file = require(path.join(__dirname, './db.json'));

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 750,
        minWidth: 1100,
        minHeight: 720,
        maxHeight: 760,
        backgroundColor: "white",
        webPreferences: {
            nodeIntegration: true,
            worldSafeExecuteJavaScript: true,
            contextIsolation: true
        }
    })
    win.removeMenu();
    win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
    createWindow();
    if(file.BBemail != "") {
        BestBuySignIn(file.BBemail, file.BBpass);
    }
})