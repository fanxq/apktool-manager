const {
  ipcMain
} = require('electron');
const db = require('./database');
const rimraf = require('rimraf');
const path = require('path');

ipcMain.handle('load-data', async (e, data) => {
  try {
    await db.sequelize.sync();
    let result = await Promise.all([
      db.DecompileTask.findAll({
        where: {
          deleteSign: 0
        },
        order: [
          ['createdAt', 'DESC']
        ]
      }),
      db.BuildTask.findAll({
        where: {
          deleteSign: 0
        },
        order: [
          ['createdAt', 'DESC']
        ]
      })
    ]);
    console.log(JSON.stringify(result));
    return {
      decompileTask: JSON.parse(JSON.stringify(result[0])),
      buildTask: JSON.parse(JSON.stringify(result[1]))
    }
  } catch (error) {
    return error;
  }
});

ipcMain.handle('add-decompile-task', async (e, data) => {
  try {
    let result = await db.DecompileTask.create(data);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('update-decompile-task', async (e, data) => {
  try {
    let task = await db.DecompileTask.findByPk(data.id);
    Object.assign(task, data);
    let result = await task.save();
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    return error;
  }
});

ipcMain.handle('add-build-task', async (e, data) => {
  try {
    let result = await db.BuildTask.create(data);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    return error;
  }
});

ipcMain.handle('update-build-task', async (e, data) => {
  try {
    let task = await db.BuildTask.findByPk(data.id);
    Object.assign(task, data);
    let result = await task.save();
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    return error;
  }
});

ipcMain.handle('get-build-tasks-by-pid', async (e, pid) => {
  try {
    let tasks = await db.BuildTask.findAll({
      where: {
        decodingTaskId: Number(pid)
      }
    });
    return JSON.parse(JSON.stringify(tasks));
  } catch (error) {
    return error;
  }
});

ipcMain.handle('delete-decompile-task', async (e, data) => {
  const t = await db.sequelize.transaction();
  try {
    let task = await db.DecompileTask.findByPk(data.id);
    task.deleteSign = 1;

    await db.BuildTask.update({
      deleteSign: 1
    }, {
      where: {
        deleteSign: 0,
        decodingTaskId: data.id
      },
      transaction: t
    });

    let result = await task.save({
      transaction: t
    });

    await new Promise((resolve, reject) => {
      if (!task.path) {
        resolve();
      }
      rimraf(path.dirname(task.path), err => {
        if (err) {
          throw err;
        }
        resolve();
      });
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    return error;
  }
});

ipcMain.handle('delete-build-task', async (e, data) => {
  try {
    let task = await db.BuildTask.findByPk(data.id);
    task.deleteSign = 1;
    await new Promise((resolve, reject) => {
      rimraf(path.dirname(task.path), err => {
        if (err) {
          throw err;
        }
        resolve();
      });
    })
    let result = await task.save();
    return result;
  } catch (error) {
    return error;
  }
});