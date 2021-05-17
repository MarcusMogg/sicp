import { DS } from "./bs"
export class MyString implements DS {
    static readonly Type = "MyString";
    readonly Type = MyString.Type
    Value: string;
    DisplayStr() {
        return `"${this.Value}"`;
    }
    equal(rhs: DS): boolean {
        return rhs.Type === MyString.Type && this.Value === (rhs as MyString).Value;
    }
    Copy(): DS {
        let res = new MyString();
        res.Value = this.Value;
        return res;
    }
}
export class MyChar implements DS {
    static readonly Type = "MyChar";
    readonly Type = MyChar.Type;
    Value: string;
    constructor(v: string) {
        this.Value = v;
    }
    DisplayStr() {
        return `#\\${this.Value}`;
    }
    equal(rhs: DS): boolean {
        return rhs.Type === MyChar.Type && this.Value === (rhs as MyChar).Value;
    }
    Copy(): DS {
        return new MyChar(this.Value);
    }
}