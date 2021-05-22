import { MyBool } from "../basic_ds/boolean";
import { DS } from "../basic_ds/bs";
import { Complex } from "../basic_ds/complex";
import { Cons } from "../basic_ds/cons";
import { Procedure } from "../basic_ds/procedure";
import { Identifier, Quotation } from "../basic_ds/quote";
import { MyChar, MyString } from "../basic_ds/string";
import { Env } from "../environment/env_base"
import * as Datum from "../expression/datum";
import { Output } from "../main";
import { Apply } from "./apply"

// FIXME: 最基本的实现，更像是元编程
export function Eval(exp: DS, env: Env): DS {
    if (Datum.selfEvaluating(exp)) {
        return exp;
    } else if (Datum.variable(exp)) {
        let result = env.Get((exp as Identifier).Value);
        if (result !== undefined && (result as DS).Type !== Procedure.Type)
            Output.getInstance().replace(exp, result);
        return result;
    } else if (Datum.quoted(exp)) {
        return (exp as Quotation).Value;
    } else if (Datum.definition(exp)) {
        evalDef(exp, env);
        return undefined;
    } else if (Datum.ifS(exp)) {
        return evalIF(exp, env);
    } else if (Datum.lambda(exp)) {
        let paras = (exp as Cons).cadr("ad") as Cons;
        let body = (exp as Cons).cadr("dd");
        return makeProcedure(paras, body, env);
    } else if (Datum.begin(exp)) {
        Output.getInstance().replace(exp, (exp as Cons).cdr());
        let res = evalSequence(exp, env);
        return res;
    } else if (Datum.cond(exp)) {
        let conds = makeCond((exp as Cons).cdr());
        Output.getInstance().replace(exp, conds);
        return Eval(exp, env);
    } else if (Datum.letS(exp)) {
        return evalLet(exp, env);
    } else if (Datum.andS(exp)) {
        return evalAnd(exp, env);
    } else if (Datum.orS(exp)) {
        return evalOR(exp, env);
    } else if (Datum.application(exp)) {
        let op = Eval((exp as Cons).car(), env) as Procedure;
        let vals = listOfValues((exp as Cons).cdr(), env)
        //Output.getInstance().replace(exp, Cons.List(op, vals));
        //op = op.Copy() as Procedure;

        Output.getInstance().replace(exp, op, false)
        let res = Apply(exp as Procedure, vals);
        //Output.getInstance().replace(exp, res);
        return res;
    } else {
        throw new Error("Unknown expression type");
    }
}

function definitionVariable(exp: DS): string {
    try {
        let cadr = (exp as Cons).cadr("ad");
        if (cadr.Type === Identifier.Type) {
            return (cadr as Identifier).Value;
        } else {
            let caadr = (exp as Cons).cadr("aad");
            return (caadr as Identifier).Value;
        }
    } catch (e) {
        throw new Error("definition error: miss definition-variable");
    }
}
function definitionValue(exp: DS): DS {
    let flag = 0;
    try {
        let cadr = (exp as Cons).cadr("ad");
        if (cadr.Type === Identifier.Type) {
            let next = (exp as Cons).cadr("dd") as Cons;
            if (!Cons.null(next.cdr() as Cons)) {
                flag = 1;
                throw new Error();
            }
            return next.car();
        } else {
            return makeLambda((exp as Cons).cadr("dad") as Cons,
                (exp as Cons).cadr("dd") as Cons);
        }
    } catch (e) {
        if (flag === 1) {
            throw new Error("definition error: multiple definition-value");
        } else {
            throw new Error("definition error: miss definition-value");
        }
    }
}
function evalDef(exp: DS, env: Env) {
    let key = definitionVariable(exp);
    let v = Eval(definitionValue(exp), env);
    Output.getInstance().replace(exp, Cons.List(new Identifier("define"), new Identifier(key), v));
    env.Set(key, v);
}

function ifPredicate(exp: DS) {
    return (exp as Cons).cadr("ad");
}
function ifConsequent(exp: DS) {
    return (exp as Cons).cadr("add");
}
function ifAlternative(exp: DS) {
    let cdddr = (exp as Cons).cadr("ddd");
    if (!Cons.null(cdddr as Cons)) {
        if (!Cons.null((cdddr as Cons).cdr() as Cons)) {
            throw new Error("if error: multiple expression");
        }
        return (cdddr as Cons).car();
    }
    return undefined;
}
function evalIF(exp: DS, env: Env): DS {
    let predicate = ifPredicate(exp);
    let result = Eval(predicate, env) as MyBool;
    //Output.getInstance().replace(predicate, result);
    if (MyBool.isTrue(result)) {
        let consequent = ifConsequent(exp);
        Output.getInstance().replace(exp, consequent);
        //let tmp = Datum.selfEvaluating(exp);
        let result = Eval(exp, env);
        //if (!tmp)
        //    Output.getInstance().replace(exp, result);
        return result
    } else {
        let alter = ifAlternative(exp);
        if (alter !== undefined || alter.Type !== Cons.Type || !Cons.null(alter as Cons)) {
            Output.getInstance().replace(exp, alter);
            //let tmp = Datum.selfEvaluating(exp);
            let result = Eval(exp, env);
            //if (!tmp)
            //    Output.getInstance().replace(exp, result);
            return result;
        }
    }
    return undefined;
}

export function evalSequence(exp: DS, env: Env): DS {
    if (Cons.null((exp as Cons).cdr() as Cons)) {
        Output.getInstance().replace(exp, (exp as Cons).car());
        let res = Eval(exp, env);
        //Output.getInstance().replace(exp, res);
        return res;
    }
    // FIXME: 这里的值是否要处理
    Output.getInstance().replace((exp as Cons).car(),
        Eval((exp as Cons).car(), env));
    Output.getInstance().replace(exp, (exp as Cons).cdr());
    return evalSequence(exp, env)
}

function makeIF(predicate: DS, consequent: DS, alternative: DS): Cons {
    if (alternative === undefined || (alternative.Type === Cons.Type && Cons.null(alternative as Cons))) {
        return Cons.List(new Identifier("if"), predicate, consequent);
    }
    return Cons.List(new Identifier("if"), predicate, consequent, alternative);
}

function makeLambda(params: Cons, body: Cons): Cons {
    return new Cons(new Identifier("lambda"), new Cons(params, body));
}

function makeProcedure(params: Cons, body: DS, env: Env): Procedure {
    return new Procedure(false, params.toArray() as Array<Identifier>, body, env);
}

function sequenceExp(exp: Cons) {
    if (Cons.null(exp)) {
        return undefined;
    }
    if (Cons.null(exp.cdr() as Cons)) {
        return exp.car();
    }
    return new Cons(new Identifier("begin"), exp)
}

function makeCond(exp: DS): DS {
    if (Cons.null(exp as Cons)) {
        return Cons.nil();
    }
    let first = (exp as Cons).car() as Cons;
    let rest = (exp as Cons).cdr() as Cons;

    if (Datum.taggedList(first, "else")) {
        if (!Cons.null(rest)) {
            throw new Error("cond : else clause isn't last");
        }
        return sequenceExp(first.cdr() as Cons);
    } else {
        return makeIF(first.car(), sequenceExp(first.cdr() as Cons), makeCond(rest))
    }
}

function evalLet(lexp: DS, env: Env): DS {
    let exp = (lexp as Cons).cdr()
    let params = (exp as Cons).car() as Cons;
    let body = (exp as Cons).cdr() as Cons;

    let v = new Array<DS>(), vs = new Array<DS>();
    while (!Cons.null(params)) {
        let cur = params.car() as Cons;
        v.push(cur.car());
        vs.push(cur.cadr("ad"));
        if (!Cons.null(cur.cadr("dd") as Cons)) {
            throw new Error("let : multiple expression");
        }
        params = params.cdr() as Cons;
    }
    let procedure = Eval(makeLambda(Cons.List(...v), body), env) as Procedure;
    let values = Cons.List(...vs);
    Output.getInstance().replace(lexp, Cons.List(procedure, values))
    values = listOfValues(values, env);
    //Output.getInstance().replace(lexp, Cons.List(procedure, values))
    Output.getInstance().replace(lexp, procedure, false)
    let res = Apply(lexp as Procedure, values);
    //Output.getInstance().replace(lexp, res)
    return res;
}

function evalAnd(lexp: DS, env: Env): DS {
    let exp = (lexp as Cons).cdr();
    if (Cons.null(exp as Cons)) {
        Output.getInstance().replace(lexp, new MyBool(true));
        return new MyBool(true);
    }
    let first = (exp as Cons).car();
    let second = (exp as Cons).cdr();
    if (Cons.null(second as Cons)) {
        Output.getInstance().replace(lexp, first);
        let tmp = Datum.selfEvaluating(lexp);
        let result = Eval(lexp, env);
        if (!tmp)
            Output.getInstance().replace(lexp, result);
        return result;
    }
    let ifs = makeIF(first, new Cons(new Identifier("and"), second), new MyBool(false));
    Output.getInstance().replace(lexp, ifs);
    return Eval(lexp, env);
}

function evalOR(lexp: DS, env: Env): DS {
    let exp = (lexp as Cons).cdr();
    if (Cons.null(exp as Cons)) {
        Output.getInstance().replace(lexp, new MyBool(false));
        return new MyBool(false);
    }
    let first = (exp as Cons).car();
    let second = (exp as Cons).cdr();
    if (Cons.null(second as Cons)) {
        Output.getInstance().replace(lexp, first);
        let tmp = Datum.selfEvaluating(lexp);
        let result = Eval(lexp, env);
        if (!tmp)
            Output.getInstance().replace(lexp, result);
        return result;
    }
    first = Eval(first, env);
    let ifs = makeIF(first, first, new Cons(new Identifier("or"), second));
    Output.getInstance().replace(lexp, ifs);
    return Eval(lexp, env);
}

function listOfValues(exp: DS, env: Env): Cons {
    if (Cons.null(exp as Cons)) {
        return Cons.nil();
    }
    let first = (exp as Cons).car()
    let tmp = Datum.selfEvaluating(first);
    first = Eval(first, env);
    //if (!tmp)
    //    Output.getInstance().replace((exp as Cons).car(), first);
    return new Cons(first,
        listOfValues((exp as Cons).cdr(), env))
}