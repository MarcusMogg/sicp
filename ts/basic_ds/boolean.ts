import { DS } from "./bs"

export class MyBool implements DS {
    static readonly Type = "MyBool";
    readonly Type = MyBool.Type
    Value: boolean;
    constructor(v: boolean) {
        this.Value = v;
    }
    DisplayStr() {
        return `#${this.Value ? "t" : "f"}`;
    }

    static isTrue(exp: DS) {
        return exp.Type !== MyBool.Type || (exp as MyBool).Value;
    }

    equal(rhs: DS): boolean {
        return rhs.Type === MyBool.Type && this.Value === (rhs as MyBool).Value;
    }
}