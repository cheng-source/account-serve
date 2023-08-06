const moment = require('moment');

const Service = require('egg').Service;

class BillService extends Service {
  async add(billItem) {
    const { app } = this;
    try {
      const result = await app.mysql.insert('bill', billItem);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async list(user_id) {
    const { ctx, app } = this;
    const QUERY_STR = 'id, pay_type, amount, date, type_id, type_name, remark';
    const sql = `select ${QUERY_STR} from bill where user_id = ${user_id}`;
    try {
      const result = await app.mysql.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async detail(id, user_id) {
    const { ctx, app } = this;
    try {
      const result = await app.mysql.get('bill', {
        id,
        user_id,
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async update(billItem) {
    const { ctx, app } = this;
    try {
      const result = await app.mysql.update('bill', { ...billItem }, {
        id: billItem.id,
        user_id: billItem.user_id,
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async delete(id, user_id) {
    const { ctx, app } = this;
    try {
      const result = await app.mysql.delete('bill', {
        id,
        user_id,
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

module.exports = BillService;
