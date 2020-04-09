const Sequelize = require('sequelize');
const dayjs = require('dayjs');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './apktool.db',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
const Model = Sequelize.Model;
class DecompileTask extends Model {};
DecompileTask.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [1, 50],
        msg: '任务名称不能超过50个字符!'
      }
    }
  },
  apkName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  path: {
    type: Sequelize.STRING
  },
  status: {
    type: Sequelize.ENUM,
    values: ['pending', 'done', 'pause']
  },
  deleteSign: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  log: {
    type: Sequelize.STRING,
    allowNull: true
  },
  createdAt: {
    type: Sequelize.DATE,
    get() {
      return dayjs(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
    }
  },
  updatedAt: {
    type: Sequelize.DATE,
    get() {
      return dayjs(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
    }
  }
}, {
  sequelize,
  tableName: 'decompile_tasks',
});

class BuildTask extends Model {};
BuildTask.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  decodingTaskId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [1, 50],
        msg: '任务名称不能超过50个字符'
      }
    }
  },
  path: {
    type: Sequelize.STRING
  },
  status: {
    type: Sequelize.ENUM,
    values: ['pending', 'done', 'pause']
  },
  deleteSign: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  log: {
    type: Sequelize.STRING,
    allowNull: true
  },
  createdAt: {
    type: Sequelize.DATE,
    get() {
      return dayjs(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
    }
  },
  updatedAt: {
    type: Sequelize.DATE,
    get() {
      return dayjs(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
    }
  }
}, {
  sequelize,
  tableName: 'build_tasks',
});

const Op = Sequelize.Op;
module.exports = {
  Op,
  sequelize,
  DecompileTask,
  BuildTask
}