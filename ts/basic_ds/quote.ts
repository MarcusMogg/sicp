import { DS } from "./bs"
export class Quotation implements DS {
    static readonly Type = "Quotation";
    readonly Type = Quotation.Type
    Value: any;
    DisplayStr() {
        return `'${this.Value}`;
    }
}

export class Identifier implements DS {
    static readonly Type = "Identifier";
    readonly Type = Identifier.Type
    Value: string;
    constructor(v: string) {
        this.Value = v;
    }
    DisplayStr() {
        return `${this.Value}`;
    }
}