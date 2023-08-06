const Controller = require('egg').Controller;
const moment = require('moment')

class BillController extends Controller {
    async add() {
        const { ctx, app } = this;
        let { pay_type, amount, date, type_id, type_name, remark } = ctx.request.body;
        if (!pay_type || !amount || !date || !type_id || !type_name || !remark) {
            ctx.body = {
                code: 400,
                msg: '参数错误',
                data: null,
            };
        }
        // 将客户端传进来的日期数据 month/day/year转化为距1970年。。。的秒数
        date = Date.parse(date) / 1000
        try {
            const token = ctx.request.header.authorization;
            const decode = app.jwt.verify(token, app.config.jwt.secret);
            if (!decode) return;
            const user_id = decode.id;
            const result = await ctx.service.bill.add({
                pay_type,
                amount,
                date,
                type_id,
                type_name,
                remark,
                user_id,
            });
            ctx.body = {
                code: 200,
                msg: '增加账单成功',
                data: null,
            };
        } catch (error) {
            ctx.body = {
                code: 500,
                msg: '增加账单失败',
                data: null,
            };
        }


    }

    async list() {
        const { ctx, app } = this;
        const { date, page = 1, page_size = 5, type_id = 'all' } = ctx.query;
        try {
            const token = ctx.request.header.authorization;
            const decode = await app.jwt.verify(token, app.config.jwt.secret);
            if (!decode) return;

            let user_id = decode.id;
            // 当前用户的账单列表
            const list = await ctx.service.bill.list(user_id);
            moment().format('YYYY-MM')
                // 过滤出月份和类型所对应的账单列表
            const _list = list.filter(item => {
                console.log(moment(Number(item.date)).format('YYYY-MM'));
                if (type_id != 'all') {
                    return moment(Number(item.date)).format('YYYY-MM') = date && type_id == item.type_id;
                }
                return moment(Number(item.date)).format('YYYY-MM') == date
            });

            let listMap = _list.reduce((cur, item) => {
                const date = moment(Number(item.date)).format('YYYY-DD');
                if (cur && cur.length && cur.findIndex(item => item.date === date) > -1) {
                    const index = cur.findIndex(item => item.date === date);
                    cur[index].bills.push(item);
                }

                if (cur && cur.length && cur.findIndex(item => item.date === date) == -1) {
                    cur.push({
                        date,
                        bills: [item]
                    })
                }

                if (!cur.length) {
                    cur.push({
                        date,
                        bills: [item]
                    })
                }
                return cur;
            }, []).sort((a, b) => moment(b.date) - moment(a.date)); // 时间顺序为倒叙，时间约新的，在越上面

            const filterListMap = listMap.slice((page - 1) * page_size, page * page_size);
            let __list = list.filter(item => moment(Number(item.date)).format('YYYY-MM') == date);

            let totalExpense = __list.reduce((cur, item) => {
                if (item.pay_type === 1) {
                    curr += Number(item.amount);
                    return curr;
                }
                return curr;
            }, 0);

            let totalIncome = __list.reduce((cur, item) => {
                if (item.pay_type == 2) {
                    curr += Number(item.amount);
                    return curr;
                }
                return curr;
            }, 0);

            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: {
                    totalExpense,
                    totalIncome,
                    totalPage: Math.ceil(listMap.length / page_size),
                    list: filterListMap || []
                }
            }


        } catch (error) {

        }
    }

    async detail() {
        const { ctx, app } = this;
        const { id = '' } = ctx.query;

        const token = ctx.request.header.authorization;
        const decode = await app.jwt.verify(token, app.config.jwt.secret);
        if (!decode) return;
        let user_id = decode.id;
        if (!id) {
            ctx.body = {
                code: 500,
                msg: '订单id不能为空',
                data: null
            }
            return;
        }

        try {
            const detail = await ctx.service.bill.detail(id, user_id);
            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: detail
            }
        } catch (error) {
            ctx.body = {
                code: 500,
                msg: '系统错误',
                data: null
            }
        }

    }

    async update() {
        const { ctx, app } = this;
        const { id, pay_type, amount, date, type_id, type_name, remark } = ctx.request.body;

        if (!amount || !type_id || !type_name || !date || !pay_type) {
            ctx.body = {
                code: 400,
                msg: '参数错误',
                date: null
            }
        }

        try {
            const token = ctx.request.header.authorization;
            const decode = await app.jwt.verify(token, app.config.jwt.secret);
            if (!decode) return;
            let user_id = decode.id;

            const result = await ctx.service.bill.update({
                id,
                pay_type,
                amount,
                date,
                type_id,
                type_name,
                user_id,
                remark

            });
            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: result
            }
        } catch (error) {
            ctx.body = {
                code: 500,
                msg: '系统错误',
                data: null
            }
        }
    }

    async delete() {
        const { ctx, app } = this;
        const { id } = ctx.request.body;
        if (!id) {
            ctx.body = {
                code: 400,
                msg: '参数错误',
                data: null
            }
        }
        try {
            const token = ctx.request.header.authorization;
            const decode = await app.jwt.verify(token, app.config.jwt.secret);
            if (!decode) return;
            let user_id = decode.id;
            const result = await ctx.service.bill.delete(id, user_id);
            ctx.body = {
                code: 200,
                msg: '删除账单成功',
                data: null
            }
        } catch (error) {
            console.log(error);
            ctx.body = {
                code: 500,
                msg: '系统错误',
                data: null
            }
        }
    }

    async data() {
        const { ctx, app } = this;
        const { date = '' } = ctx.query;
        try {
            const token = ctx.request.header.authorization;
            const decode = await app.jwt.verify(token, app.config.jwt.secret);
            if (!decode) return;
            let user_id = decode.id;
            const result = await ctx.service.bill.list(user_id);
            // 月初
            const start = moment(date).startOf('month').unix();
            // 月尾
            const end = moment(date).endOf('month').unix();
            // 当月的数据
            const _date = result.filter(item => (Number(item.date) >= start && Number(item.date) <= end));
            console.log(_date);
            // 总花销
            const total_expense = _date.reduce((res, cur) => {
                if (cur.pay_type == 1) {
                    console.log(cur);
                    res += Number(cur.amount);
                }
                return res;
            }, 0);
            console.log(total_expense);

            // 总收入
            const total_income = _date.reduce((res, cur) => {
                if (cur.pay_type == 2) {
                    res += Number(cur.amount);
                }
                return res;
            }, 0);

            // 汇总数据
            let total_date = _date.reduce((arr, cur) => {
                const index = arr.findIndex((item) => item.type_id === cur.type_id);
                if (index == -1) {
                    arr.push({
                        type_id: cur.type_id,
                        type_name: cur.type_name,
                        pay_type: cur.pay_type,
                        amount: Number(cur.amount)
                    })
                }

                if (index > -1) {
                    arr[index].amount += Number(cur.amount)
                }
                return arr;
            }, []);

            total_date = total_date.map(item => {
                item.account = Number(Number(item.account).toFixed(2));
                return item;
            });

            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: {
                    total_expense: Number(total_expense).toFixed(2),
                    total_income: Number(total_income).toFixed(2),
                    total_date: total_date || []
                }
            }

        } catch (error) {
            console.log(error);
            ctx.body = {
                code: 500,
                msg: '系统错误',
                data: null
            }
        }
    }
}

module.exports = BillController;