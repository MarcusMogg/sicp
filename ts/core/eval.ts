import { MyBool } from "../basic_ds/boolean";
import { DS } from "../basic_ds/bs";
import { Complex } from "../basic_ds/complex";
import { Cons } from "../basic_ds/cons";
import { Procedure } from "../basic_ds/procedure";
import { Identifier, Quotation } from "../basic_ds/quote";
import { MyChar, MyString } from "../basic_ds/string";
import { Env } from "../environment/env_base"
import * as Datum from "../expression/datum";
import { Apply } from "./apply"

// FIXME: 最基本的实现，更像是元编程
export function Eval(exp: DS, env: Env): DS {
    if (Datum.selfEvaluating(exp)) {
        return exp;
    } else if (Datum.variable(exp)) {
        return env.Get((exp as Identifier).Value);
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
        return evalSequence((exp as Cons).cdr(), env);
    } else if (Datum.cond(exp)) {
        return Eval(makeCond((exp as Cons).cdr()), env);
    } else if (Datum.letS(exp)) {
        return evalLet(((exp as Cons).cdr()), env);
    } else if (Datum.application(exp)) {

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
            if (next.cdr() !== undefined) {
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
    env.Set(definitionVariable(exp), Eval(definitionValue(exp), env));
}

function ifPredicate(exp: DS) {
    return (exp as Cons).cadr("ad");
}
function ifConsequent(exp: DS) {
    return (exp as Cons).cadr("add");
}
function ifAlternative(exp: DS) {
    let cdddr = (exp as Cons).cadr("ddd");
    if (cdddr !== undefined) {
        if ((cdddr as Cons).cdr() !== undefined) {
            throw new Error("if error: multiple expression");
        }
        return (cdddr as Cons).car();
    }
    return undefined;
}
function evalIF(exp: DS, env: Env): DS {
    if (MyBool.isTrue(Eval(ifPredicate(exp), env))) {
        return Eval(ifConsequent(exp), env);
    } else {
        let alter = ifAlternative(exp);
        if (alter !== undefined) {
            return Eval(alter, env);
        }
    }
    return undefined;
}

function evalSequence(exp: DS, env: Env): DS {
    if ((exp as Cons).cdr() === undefined) {
        return Eval((exp as Cons).car(), env);
    }
    // FIXME: 这里的值是否要处理
    Eval((exp as Cons).car(), env);
    return Eval((exp as Cons).cdr(), env)
}

function makeIF(predicate: DS, consequent: DS, alternative: DS): Cons {
    if (alternative === undefined) {
        return Cons.List(new Identifier("if"), predicate, consequent);
    }
    return Cons.List(new Identifier("if"), predicate, consequent, alternative);
}

function makeLambda(params: Cons, body: Cons): Cons {
    return Cons.List(new Identifier("lambda"), params, body);
}

function makeProcedure(params: Cons, body: DS, env: Env): Procedure {
    return new Procedure(params.toArray(), body, env);
}

function sequenceExp(exp: Cons) {
    if (exp === undefined) {
        return undefined;
    }
    if (exp.cdr() === undefined) {
        return exp.car();
    }
    return new Cons(new Identifier("begin"), exp)
}

function makeCond(exp: DS): DS {
    if (exp === undefined) {
        return undefined;
    }
    let first = (exp as Cons).car() as Cons;
    let rest = (exp as Cons).cdr() as Cons;

    if (Datum.taggedList(first, "else")) {
        if (rest !== undefined) {
            throw new Error("cond : else clause isn't last");
        }
        return sequenceExp(first.cdr() as Cons);
    } else {
        return makeIF(first.car(), first.cdr(), makeCond(rest))
    }
}

function evalLet(exp: DS, env: Env): DS {
    let params = (exp as Cons).car() as Cons;
    let body = (exp as Cons).cdr() as Cons;

    let v = new Array<DS>(), vs = new Array<DS>();
    while (params !== undefined) {
        let cur = params.car() as Cons;
        v.push(cur.car());
        vs.push(cur.cadr("ad"));
        if (cur.cadr("dd") !== undefined) {
            throw new Error("let : multiple expression");
        }
        params = params.cdr() as Cons;
    }
    // FIXME：函数执行需要修改环境，应该相当于application
    return Apply(Eval(makeLambda(Cons.List(...v), body), env), env);
}