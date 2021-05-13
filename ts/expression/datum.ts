import { MyBool } from "../basic_ds/boolean";
import { DS } from "../basic_ds/bs";
import { Complex } from "../basic_ds/complex";
import { Cons } from "../basic_ds/cons";
import { Identifier, Quotation } from "../basic_ds/quote";
import { MyChar, MyString } from "../basic_ds/string";
import * as TT from "../tokenizer/toke_type"

export function parse(token: Generator<TT.TokenType, void, unknown>): DS {
    let cur; let t: TT.TokenType;
    cur = token.next();
    if (cur.done) {
        return undefined;
    }
    t = cur.value as TT.TokenType;
    let next = () => {
        cur = token.next();
        if (cur.done) {
            throw new Error("Datum parse error: unexpected EOF");
        }
        t = cur.value as TT.TokenType;
    };
    if (t.Type === TT.TokenApostrophe.Type) {
        let tmp = new Quotation();
        tmp.Value = parse(token);
        return tmp;
    } else if (t.Type === TT.TokenBracketsLeftRound.Type) {
        let a: Array<DS> = new Array();
        next();
        while (TT.TokenBracketsRightRound.Type !== t.Type) {
            if (t.Type === TT.TokenDot.Type) {
                if (a.length === 0) {
                    throw new Error("Datum parse error: not enough datum before dot");
                } else {
                    a.push(new Identifier("."));
                    next();
                    a.push(parse(token))
                    next();
                    if (TT.TokenBracketsRightRound.Type !== t.Type) {
                        throw new Error("Datum parse error: multiple datum before dot");
                    }
                }
            } else {
                a.push(parse(token))
                next();
            }
        }
        return Cons.MakeFromArray(a);
    } else if (t.Type === TT.TokenBoolean.Type
        || t.Type === TT.TokenComplex.Type
        || t.Type === TT.TokenChar.Type
        || t.Type === TT.TokenString.Type
        || t.Type === TT.TokenIdentifier.Type) {
        return t.Value;
    } else {
        throw new Error("Datum parse error: unexpected token type");
    }
}

export function selfEvaluating(exp: DS) {
    return exp.Type === MyChar.Type
        || exp.Type === MyString.Type
        || exp.Type === Complex.Type
        || exp.Type === MyBool.Type;
}

export function variable(exp: DS) {
    return exp.Type === Identifier.Type;
}

export function quoted(exp: DS) {
    return exp.Type === Quotation.Type;
}

export function taggedList(exp: DS, tag: string) {
    if (exp.Type === Cons.Type) {
        let car = (exp as Cons).car();
        return car.Type === Identifier.Type && (car as Identifier).Value === tag;
    }
    return false;
}

export function definition(exp: DS) {
    return taggedList(exp, "define")
}

export function ifS(exp: DS) {
    return taggedList(exp, "if")
}

export function lambda(exp: DS) {
    return taggedList(exp, "lambda")
}

export function begin(exp: DS) {
    return taggedList(exp, "begin")
}

export function cond(exp: DS) {
    return taggedList(exp, "cond")
}

export function letS(exp: DS) {
    return taggedList(exp, "let")
}

export function application(exp: DS) {
    return exp.Type === Cons.Type;
}
