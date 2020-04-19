const {
  ipcMain
} = require('electron');
const db = require('./database');
const rimraf = require('rimraf');
const path = require('path');
const dayjs = require('dayjs');

ipcMain.handle('load-data', async (e, data) => {
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
  // console.log(JSON.stringify(result));
  return {
    decompileTask: JSON.parse(JSON.stringify(result[0])),
    buildTask: JSON.parse(JSON.stringify(result[1]))
  };
});

ipcMain.handle('add-decompile-task', async (e, data) => {
  let findResult = await db.DecompileTask.findOne({
    where: {
      name: data.name,
      deleteSign: 0
    }
  });
  if (findResult) {
    throw new Error(`任务名称：${data.name}已存在，请重新输入！`);
  }
  let result = await db.DecompileTask.create(data);
  return JSON.parse(JSON.stringify(result));
});

ipcMain.handle('update-decompile-task', async (e, data) => {
  let task = await db.DecompileTask.findByPk(data.id);
  Object.assign(task, data);
  let result = await task.save();
  return JSON.parse(JSON.stringify(result));
});

ipcMain.handle('add-build-task', async (e, data) => {
  let findResult = await db.BuildTask.findOne({
    where: {
      name: data.name,
      decodingTaskId: data.decodingTaskId,
      deleteSign: 0
    }
  });
  if (findResult) {
    throw `任务名称：${data.name}已存在，请重新输入！`;
  }
  let result = await db.BuildTask.create(data);
  return JSON.parse(JSON.stringify(result));
});

ipcMain.handle('update-build-task', async (e, data) => {
  let task = await db.BuildTask.findByPk(data.id);
  Object.assign(task, data);
  let result = await task.save();
  return JSON.parse(JSON.stringify(result));
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
    throw error;
  }
});

ipcMain.handle('delete-build-task', async (e, data) => {
  let task = await db.BuildTask.findByPk(data.id);
  task.deleteSign = 1;
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
  })
  let result = await task.save();
  return result;
});

ipcMain.handle('find-decompile-tasks', async (e, data) => {
  let tasks;
  if (data) {
    data = data.toLowerCase();
    tasks = await db.sequelize.query(`select * from decompile_tasks where LOWER(name) like '%${data}%' and deleteSign = 0 order by createdAt DESC`, {
      type: db.sequelize.QueryTypes.SELECT
    });
    if (tasks && tasks.length !== 0) {
      tasks.forEach(x => {
        x.createdAt = dayjs(x.createdAt).format('YYYY-MM-DD HH:mm:ss');
        x.updatedAt = dayjs(x.updatedAt).format('YYYY-MM-DD HH:mm:ss');
      })
    }
  } else {
    tasks = await db.DecompileTask.findAll({
      where: {
        deleteSign: 0
      },
      order: [
        ['createdAt', 'DESC']
      ]
    });
  }

  return JSON.parse(JSON.stringify(tasks));
});