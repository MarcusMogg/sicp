import { Env } from "../environment/env_base"

namespace Core {

    // FIXME: 应该返回一个什么样的接口
    function Eval(exp: Exp.ExpBase, env: Env): Exp.ExpBase {
        switch (exp.Type) {
            case Exp.ExpType.SelfEvaluating:
                return exp;
            case Exp.ExpType.Variable:
            // TODO: ExpBase 类 Variable
            // return env.Get((exp as Variable).Vaule)
            case Exp.ExpType.Quoted:
            // TODO: ExpBase 类 Quotation 变量名
            case Exp.ExpType.Assignment:
            // TODO: 赋值
            // return EvalAssign(exp,env);
            case Exp.ExpType.Definition:
            // TODO: 定义
            // return EvalDefine(exp,env);
            case Exp.ExpType.IF:
            // TODO: IFELSE
            // return EvalIF(exp,env);
            case Exp.ExpType.Lambda:
            // TODO: 如何表示一个lambda
            case Exp.ExpType.Begin:
            // TODO: 执行一串命令
            case Exp.ExpType.Cond:
            // TODO: 执行cond 为true的部分
            // return Eval(CondTrue(exp),env);
            case Exp.ExpType.Application:
            // TODO: 完成apply 函数，执行一个过程
            // apply()
            case Exp.ExpType.Let:
            // TODO：生成一个新的子环境
            default:
                throw new Error("Unknown expression type");
        }
    }
}