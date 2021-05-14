import { DS } from "../basic_ds/bs";
import { Complex } from "../basic_ds/complex";
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
        if (value === undefined) {
            throw new Error("produce: the expected number of arguments does not match the given number");
        }
        e.Set(element.Value, value.car());
        value = value.cdr() as Cons;
    }
    if (paramTemple.length >= 2 && paramTemple[-2].Value === ".") {
        e.Set(paramTemple[-1].Value, value);
        value = undefined;
    }
    if (value !== undefined) {
        throw new Error("produce: the expected number of arguments does not match the given number");
    }
    return e;
}

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

export function baseEnv(): SimpleEnv {
    let res = new SimpleEnv();
    res.Set("+", plus());
    return res;
}