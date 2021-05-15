import { MyBool } from "../basic_ds/boolean";
import { DS } from "../basic_ds/bs";
import { Complex, Rational, Real } from "../basic_ds/complex";
import { Cons } from "../basic_ds/cons";
import { Procedure } from "../basic_ds/procedure";
import { Identifier } from "../basic_ds/quote";
import { Env, SimpleEnv } from "../environment/env_base";
import { evalSequence } from "./eval";

// TODO: 如何表示一个过程
export function Apply(produce: Procedure, params: Cons): DS {
    if (produce.primitive) {
        return (produce.body as ((x: Array<DS>) => DS))(params.toArray())
    } else {
        return evalSequence(produce.body as DS, extendEnv(produce.env, produce.parameters, params))
    }
}

function extendEnv(env: Env, paramTemple: Array<Identifier>, value: Cons): Env {
    let e = env.MakeChild();
    for (let index = 0; index < paramTemple.length; index++) {
        const element = paramTemple[index];
        if (element.Value === ".") {
            if (index !== paramTemple.length - 2) {
                throw new Error("produce: unexpected identifier dot");
            }
            break;
        }
        if (Cons.null(value)) {
            throw new Error("produce: the expected number of arguments does not match the given number");
        }
        e.Set(element.Value, value.car());
        value = value.cdr() as Cons;
    }
    if (paramTemple.length >= 2 && paramTemple[paramTemple.length - 2].Value === ".") {
        e.Set(paramTemple[-1].Value, value);
        value = undefined;
    }
    if (!Cons.null(value)) {
        throw new Error("produce: the expected number of arguments does not match the given number");
    }
    return e;
}
// +
function plus() {
    let body = (x: Array<DS>): DS => {
        let res: Complex = new Complex();
        for (const i of x) {
            res.plus(i as Complex)
        }
        return res;
    }
    return new Procedure(true, undefined, body, undefined);
}
// -
function sub() {
    let body = (x: Array<DS>): DS => {
        if (x.length < 1) {
            throw new Error("- : expected at least 1 argument");
        }
        let res: Complex = new Complex();
        if (x.length > 1) {
            res.plus(x[0] as Complex);
            res.plus(x[0] as Complex);
        }
        for (const i of x) {
            res.minus(i as Complex);
        }
        return res;
    }
    return new Procedure(true, undefined, body, undefined);
}
// =
function equal() {
    let body = (x: Array<DS>): DS => {
        if (x.length < 1) {
            throw new Error("= : expected at least 1 argument");
        }
        let res = x[0] as Complex;
        for (const i of x) {
            if (!res.equal(i as Complex)) {
                return new MyBool(false);
            }
        }
        return new MyBool(true);
    }
    return new Procedure(true, undefined, body, undefined);
}
// eq? 
function equal1() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 2) {
            throw new Error("eq? : expected 2 arguments");
        }
        if (x[0] === undefined || x[1] === undefined) {
            return new MyBool(x[1] === x[0]);
        }
        return new MyBool(x[1].equal(x[0]));
    }
    return new Procedure(true, undefined, body, undefined);
}
// equal? 
function equal2() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 2) {
            throw new Error("eq? : expected 2 arguments");
        }
        if (x[0] === undefined || x[1] === undefined) {
            return new MyBool(x[1] === x[0]);
        }
        return new MyBool(x[1].DisplayStr() === x[0].DisplayStr());
    }
    return new Procedure(true, undefined, body, undefined);
}
//(number? obj) 
function isNumber() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 1) {
            throw new Error("number? : expected 1 arguments");
        }
        return new MyBool(x[0] !== undefined && x[0].Type === Complex.Type);
    }
    return new Procedure(true, undefined, body, undefined);
}
//(complex? obj) 
function isComplex() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 1) {
            throw new Error("complex? : expected 1 arguments");
        }
        return new MyBool(x[0] !== undefined
            && x[0].Type === Complex.Type);
    }
    return new Procedure(true, undefined, body, undefined);
}
//(real? obj) 
function isReal() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 1) {
            throw new Error("complex? : expected 1 arguments");
        }
        return new MyBool(x[0] !== undefined
            && x[0].Type === Complex.Type
            && (x[0] as Complex).UnRealPart.Zero());
    }
    return new Procedure(true, undefined, body, undefined);
}
//(rational? obj) 
function isRational() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 1) {
            throw new Error("complex? : expected 1 arguments");
        }
        return new MyBool(x[0] !== undefined
            && x[0].Type === Complex.Type
            && (x[0] as Complex).UnRealPart.Zero()
            && typeof ((x[0] as Complex).RealPart.Value) !== "number");
    }
    return new Procedure(true, undefined, body, undefined);
}
//(integer? obj) 
function isInteger() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 1) {
            throw new Error("complex? : expected 1 arguments");
        }
        if (x[0] !== undefined
            && x[0].Type === Complex.Type
            && (x[0] as Complex).UnRealPart.Zero()) {
            if (typeof ((x[0] as Complex).RealPart.Value) === "number") {
                let tmp = (x[0] as Complex).RealPart.Value as number;
                return new MyBool(Number.isInteger(tmp));
            } else {
                return new MyBool(((x[0] as Complex).RealPart.Value as Rational).Denominator === 1);
            }
        }
        return new MyBool(false);

    }
    return new Procedure(true, undefined, body, undefined);
}
// (< x1 x2 x3 ...) 
function less() {
    let body = (x: Array<DS>): DS => {
        if (x.length < 1) {
            throw new Error("< : expected at least 1 argument");
        }
        let res = x[0] as Complex;
        for (let index = 1; index < x.length; index++) {
            const element = x[index];
            if (!res.less(element as Complex)) {
                return new MyBool(false);
            }
            res = element as Complex;
        }
        return new MyBool(true);
    }
    return new Procedure(true, undefined, body, undefined);
}
// (> x1 x2 x3 ...) 
function great() {
    let body = (x: Array<DS>): DS => {
        if (x.length < 1) {
            throw new Error("> : expected at least 1 argument");
        }
        let res = x[0] as Complex;
        for (let index = 1; index < x.length; index++) {
            const element = x[index];
            if (res.less(element as Complex) || res.equal(element as Complex)) {
                return new MyBool(false);
            }
            res = element as Complex;
        }
        return new MyBool(true);
    }
    return new Procedure(true, undefined, body, undefined);
}
// (<= x1 x2 x3 ...) 
function lessE() {
    let body = (x: Array<DS>): DS => {
        if (x.length < 1) {
            throw new Error("<= : expected at least 1 argument");
        }
        let res = x[0] as Complex;
        for (let index = 1; index < x.length; index++) {
            const element = x[index];
            if (!res.less(element as Complex) && !res.equal(element as Complex)) {
                return new MyBool(false);
            }
            res = element as Complex;
        }
        return new MyBool(true);
    }
    return new Procedure(true, undefined, body, undefined);
}
// (>= x1 x2 x3 ...) 
function greatE() {
    let body = (x: Array<DS>): DS => {
        if (x.length < 1) {
            throw new Error(">= : expected at least 1 argument");
        }
        let res = x[0] as Complex;
        for (let index = 1; index < x.length; index++) {
            const element = x[index];
            if (res.less(element as Complex)) {
                return new MyBool(false);
            }
            res = element as Complex;
        }
        return new MyBool(true);
    }
    return new Procedure(true, undefined, body, undefined);
}
//(* z1 ...)
function times() {
    let body = (x: Array<DS>): DS => {
        let res: Complex = new Complex();
        res.RealPart = Real.MakeFromFloat(true, 1);
        for (const i of x) {
            res.times(i as Complex)
        }
        return res;
    }
    return new Procedure(true, undefined, body, undefined);
}
//(/ z1)
//(/ z1 ...)
function div() {
    let body = (x: Array<DS>): DS => {
        if (x.length < 1) {
            throw new Error("/ : expected at least 1 argument");
        }
        let res: Complex = new Complex();
        res.RealPart = Real.MakeFromFloat(true, 1);
        if (x.length > 1) {
            res.times(x[0] as Complex);
            res.times(x[0] as Complex);
        }
        for (const i of x) {
            res.div(i as Complex);
        }
        return res;
    }
    return new Procedure(true, undefined, body, undefined);
}

export function baseEnv(): SimpleEnv {
    let res = new SimpleEnv();
    res.Set("+", plus());
    res.Set("-", sub());
    res.Set("*", times());
    res.Set("/", div());
    res.Set("=", equal());
    res.Set(">", less());
    res.Set(">=", lessE());
    res.Set("<", great());
    res.Set("<=", greatE());
    res.Set("eq?", equal1());
    res.Set("equal?", equal2());
    res.Set("nil", Cons.nil());
    res.Set("number?", isNumber());
    res.Set("complex?", isComplex());
    res.Set("real?", isReal());
    res.Set("rational?", isRational());
    res.Set("integer?", isInteger());
    return res;
}