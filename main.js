const {
  app,
  BrowserWindow,
  Tray,
  Menu
} = require('electron')
const fs = require('fs');
const path = require('path');
require('./ipcMainHandlers');

const userDataPath = path.join(app.getPath('userData'), 'userData');
global.userDataPath = userDataPath;

const assetsPath = path.join(__dirname, 'assets');
global.assetsPath = assetsPath;

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win
let tray = null;
const gotTheLock = app.requestSingleInstanceLock();

function createWindow() {
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath);
  }
  // 创建浏览器窗口。
  win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    maximizable: false,
    backgroundColor: '#f4f4f4',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.setMenu(null);

  // 加载index.html文件
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:8080');
    // 打开开发者工具
    win.webContents.openDevTools({
      mode: 'detach'
    });
  } else {
    win.loadFile(`${__dirname}/dist/index.html`)
  }


  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    win = null;
  });

  win.on('close', (event) => {
    win.hide();
    win.setSkipTaskbar(true);
    event.preventDefault();
  });

  // win.on('show', () => {
  //   tray.setHighlightMode('always')
  // });

  // win.on('hide', () => {
  //   tray.setHighlightMode('never')
  // });
  //创建系统通知区菜单
  tray = new Tray(path.join(__dirname, 'assets', 'icon.ico'));
  const contextMenu = Menu.buildFromTemplate([{
      label: '退出',
      click: () => {
        win.destroy();
      }
    }, //我们需要在这里有一个真正的退出（这里直接强制退出）
  ])
  tray.setToolTip('Apktool Manager');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => { //我们这里模拟桌面程序点击通知区图标实现打开关闭应用的功能
    win.isVisible() ? win.hide() : win.show()
    win.isVisible() ? win.setSkipTaskbar(false) : win.setSkipTaskbar(true);
  })
}

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      if (!win.isVisible()) win.show();
      win.focus()
    }
  });

  app.on('ready', createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (win === null) {
      createWindow();
    }
  });
}


