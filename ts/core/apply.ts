import { MyBool } from "../basic_ds/boolean";
import { DS } from "../basic_ds/bs";
import { Complex, Rational, Real, gcd } from "../basic_ds/complex";
import { Cons } from "../basic_ds/cons";
import { Procedure } from "../basic_ds/procedure";
import { Identifier } from "../basic_ds/quote";
import { MyChar, MyString } from "../basic_ds/string";
import { Env, SimpleEnv } from "../environment/env_base";
import { Output } from "../main";
import { evalSequence } from "./eval";

// TODO: 如何表示一个过程
export function Apply(produce: Procedure, params: Cons): DS {
    let cp = produce.Copy() as Procedure;
    if (produce.primitive) {
        let res = (produce.body as ((x: Array<DS>) => DS))(params.toArray());
        Output.getInstance().replace(produce, res)
        return res;
    } else {
        Output.getInstance().replace(produce, cp.body)
        return evalSequence(produce, extendEnv(cp.env, cp.parameters, params))
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
//(quotient n1 n2)
function quotient() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 2) {
            throw new Error("quotient : expected 2 arguments");
        }
        let a = (x[0] as Complex).RealPart.toInt();
        let b = (x[1] as Complex).RealPart.toInt();
        let res = new Complex();
        a -= a % b;
        res.RealPart = Real.MakeFromRational(Rational.MakeFromInteger(a / b, 1));
        return res;
    }
    return new Procedure(true, undefined, body, undefined);
}
//(remainder n1 n2)
function remainder() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 2) {
            throw new Error("remainder : expected 2 arguments");
        }
        let a = (x[0] as Complex).RealPart.toInt();
        let b = (x[1] as Complex).RealPart.toInt();
        let res = new Complex();
        res.RealPart = Real.MakeFromRational(Rational.MakeFromInteger(a % b, 1));
        return res;
    }
    return new Procedure(true, undefined, body, undefined);
}
//(gcd n1 n2)
function gcdf() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 2) {
            throw new Error("gcd : expected 2 arguments");
        }
        let a = (x[0] as Complex).RealPart.toInt();
        let b = (x[1] as Complex).RealPart.toInt();
        let res = new Complex();
        res.RealPart = Real.MakeFromRational(Rational.MakeFromInteger(gcd(a, b), 1));
        return res;
    }
    return new Procedure(true, undefined, body, undefined);
}
//(lcm n1 n2)
function lcm() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 2) {
            throw new Error("lcm : expected 2 arguments");
        }
        let a = (x[0] as Complex).RealPart.toInt();
        let b = (x[1] as Complex).RealPart.toInt();
        let res = new Complex();
        res.RealPart = Real.MakeFromRational(Rational.MakeFromInteger(a / gcd(a, b) * b, 1));
        return res;
    }
    return new Procedure(true, undefined, body, undefined);
}
//(not obj)
function not() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 1) {
            throw new Error("not : expected 2 arguments");
        }
        return new MyBool(x[0].Type === MyBool.Type && !(x[0] as MyBool).Value);
    }
    return new Procedure(true, undefined, body, undefined);
}
//(pair? obj) 
function isPair() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 1) {
            throw new Error("pair? : expected 1 arguments");
        }
        return new MyBool(x[0].Type === Cons.Type);
    }
    return new Procedure(true, undefined, body, undefined);
}
//(cons obj1 obj2) 
function cons() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 2) {
            throw new Error("cons : expected 2 arguments");
        }
        return new Cons(x[0], x[1]);
    }
    return new Procedure(true, undefined, body, undefined);
}
//(car pair) 
function car() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 1) {
            throw new Error("car : expected 1 arguments");
        }
        return (x[0] as Cons).car();
    }
    return new Procedure(true, undefined, body, undefined);
}
//(cdr pair) 
function cdr() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 1) {
            throw new Error("cdr : expected 1 arguments");
        }
        return (x[0] as Cons).cdr();
    }
    return new Procedure(true, undefined, body, undefined);
}
//(ca...d...r pair) 
function cadsr(ads: string) {
    let body = (x: Array<DS>): DS => {
        if (x.length != 1) {
            throw new Error(`c${ads}r : expected 1 arguments`);
        }
        return (x[0] as Cons).cadr(ads);
    }
    return new Procedure(true, undefined, body, undefined);
}
//(null? obj) 
function isNull() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 1) {
            throw new Error("cdr : expected 1 arguments");
        }
        return new MyBool(Cons.null(x[0] as Cons));
    }
    return new Procedure(true, undefined, body, undefined);
}
//(list? obj) 
function isList() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 1) {
            throw new Error("list? : expected 1 arguments");
        }
        return new MyBool((x[0] as Cons).isList());
    }
    return new Procedure(true, undefined, body, undefined);
}
//(list obj ...) 
function list() {
    let body = (x: Array<DS>): DS => {
        if (x.length < 1) {
            throw new Error("list : expected at least 1 arguments");
        }
        return Cons.List(...x);
    }
    return new Procedure(true, undefined, body, undefined);
}

// (symbol? obj)
function isSymbol() {
    let body = (x: Array<DS>): DS => {
        if (x.length != 1) {
            throw new Error("symbol? : expected 1 arguments");
        }
        return new MyBool(x[0].Type === Identifier.Type);
    }
    return new Procedure(true, undefined, body, undefined);
}
// (dsiplay obj)
function dsiplay() {
    let body = (x: Array<DS>): DS => {
        for (const iterator of x) {
            if (iterator instanceof MyString || iterator instanceof MyChar) {
                Output.getInstance().display(iterator.Value);
            } else {
                Output.getInstance().display(iterator.DisplayStr());
            }

        }
        return undefined;
    }
    return new Procedure(true, undefined, body, undefined);
}
// (newline)
function newline() {
    let body = (x: Array<DS>): DS => {
        Output.getInstance().display("\n");
        return undefined;
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
    res.Set("<", less());
    res.Set("<=", lessE());
    res.Set(">", great());
    res.Set(">=", greatE());
    res.Set("eq?", equal1());
    res.Set("equal?", equal2());
    res.Set("nil", Cons.nil());
    res.Set("number?", isNumber());
    res.Set("complex?", isComplex());
    res.Set("real?", isReal());
    res.Set("rational?", isRational());
    res.Set("integer?", isInteger());
    res.Set("quotient", quotient());
    res.Set("remainder", remainder());
    res.Set("gcd", gcdf());
    res.Set("lcm", lcm());
    res.Set("not", not());
    res.Set("pair?", isPair());
    res.Set("cons", cons());
    res.Set("car", car());
    res.Set("cdr", cdr());
    res.Set("null?", isNull());
    res.Set("list?", isList());
    res.Set("list", list());
    res.Set("symbol?", isSymbol());
    res.Set("display", dsiplay());
    res.Set("newline", newline());
    let setCads = (k: number) => {
        for (let i = 0; i < (1 << k); i++) {
            let ads = "";
            for (let j = 0; j < k; j++) {
                if (((i >> j) & 1) === 0) {
                    ads += "a";
                } else {
                    ads += "d";
                }
            }
            let tmp = `c${ads}r`;
            //console.log(tmp);
            res.Set(tmp, cadsr(ads));
        }
    }
    setCads(2);
    setCads(3);
    setCads(4);
    return res;
}