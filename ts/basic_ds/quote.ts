import { DS } from "./bs"
export class Quotation implements DS {
    static readonly Type = "Quotation";
    readonly Type = Quotation.Type
    Value: DS;
    DisplayStr() {
        return `'${this.Value.DisplayStr()}`;
    }
    equal(rhs: DS): boolean {
        return rhs.Type === Quotation.Type && this.Value.equal((rhs as Quotation).Value);
    }
    Copy(): DS {
        let res = new Quotation();
        res.Value = this.Value.Copy();
        return res;
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
    equal(rhs: DS): boolean {
        return rhs.Type === Identifier.Type && this.Value === (rhs as Identifier).Value;
    }
    Copy(): DS {
        return new Identifier(this.Value);
    }
}