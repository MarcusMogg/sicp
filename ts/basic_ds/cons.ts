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
        return "()";
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
            return undefined;
        }
        return new Cons(data[0], Cons.List(...data.splice(1)));
    }
}