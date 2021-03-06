import { DS } from "./bs"
export class Cons implements DS {
    static readonly Type = "Cons";
    readonly Type = Cons.Type;
    first: DS;
    second: DS;
    constructor(f: DS, s: DS) {
        this.first = f;
        this.second = s;
    }
    DisplayStr() {
        let res = "(";
        if (this.first !== undefined) {
            res += this.first.DisplayStr();
        }
        if (this.second === undefined) {
            res += ")";
        }
        else if (this.second instanceof Cons) {
            // remove '(' for list
            res += " " + this.second.DisplayStr().slice(1);
        } else {
            res += " " + this.second.DisplayStr() + ")";
        }
        return res;
    }
    car() {
        return this.first;
    }
    cdr() {
        return this.second;
    }
    cadr(ads: string) {
        let res: DS = this;
        for (let index = ads.length - 1; index >= 0; index--) {
            if (res.Type !== Cons.Type) {
                throw new Error(`Cons cadr error: not a pair after ${ads.slice(index)}`);
            }
            if (ads[index] === "a") {
                res = (res as Cons).car();
            } else if (ads[index] === "d") {
                res = (res as Cons).cdr();
            } else {
                throw new Error(`Cons cadr error: unexpected char ${ads[index]}`);
            }
        }
        return res;
    }

    toArray(): Array<DS> {
        let res = new Array<DS>();
        if (Cons.null(this)) {
            return res;
        }
        res.push(this.car());
        if (this.second !== undefined) {
            if (this.second instanceof Cons) {
                res.push(...this.second.toArray());
            } else {
                res.push(this.second);
            }
        }
        return res;
    }

    static List(...data: Array<DS>): Cons {
        if (data.length === 0) {
            return Cons.nil();
        }
        return new Cons(data[0], Cons.List(...data.splice(1)));
    }

    static nil(): Cons {
        return new Cons(undefined, undefined);
    }

    equal(rhs: DS): boolean {
        return rhs.Type === Cons.Type &&
            this.first === (rhs as Cons).first &&
            this.second === (rhs as Cons).second;
    }

    static null(v: Cons): boolean {
        return v === undefined || (v.first === undefined && v.second === undefined);
    }

    isList(): boolean {
        if (Cons.null(this)) return true;
        return this.second.Type === Cons.Type && (this.second as Cons).isList();
    }

    Copy(): DS {
        let f = undefined, s = undefined;
        if (this.first !== undefined) {
            f = this.first.Copy();
        }
        if (this.second !== undefined) {
            s = this.second.Copy();
        }
        return new Cons(f, s);
    }
}