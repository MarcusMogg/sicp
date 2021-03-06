import { MyBool } from "../basic_ds/boolean";
import * as DSC from "../basic_ds/complex"
import { Identifier } from "../basic_ds/quote";
import * as DSS from "../basic_ds/string"
export interface TokenType {
    Type: string;
    Value: any;
    DisplayStr(): string;
}

export class TokenBracketsLeftRound implements TokenType {
    static Type = "BracketsLeftRound";
    readonly Type = TokenBracketsLeftRound.Type;
    readonly Value = "(";
    DisplayStr() {
        return this.Value;
    }
}

export class TokenBracketsRightRound implements TokenType {
    static Type = "BracketsRightRound";
    readonly Type = TokenBracketsRightRound.Type;
    readonly Value = ")";
    DisplayStr() {
        return this.Value;
    }
}


export class TokenComma implements TokenType {
    static Type = "Comma";
    readonly Type = TokenComma.Type;
    readonly Value = ",";
    DisplayStr() {
        return this.Value;
    }
}

export class TokenApostrophe implements TokenType {
    static Type = "Apostrophe";
    readonly Type = TokenApostrophe.Type;
    readonly Value = "'";
    DisplayStr() {
        return this.Value;
    }
}

export class TokenDot implements TokenType {
    static Type = "Dot";;
    readonly Type = TokenDot.Type;
    readonly Value = ".";
    DisplayStr() {
        return this.Value;
    }
}

export class TokenDot3 implements TokenType {
    static Type = "Dot3";
    readonly Type = TokenDot3.Type;
    readonly Value = "...";
    DisplayStr() {
        return this.Value;
    }
}

export class TokenComment implements TokenType {
    static Type = "Comment";
    readonly Type = TokenComment.Type;
    Value: string;
    constructor(v: string) {
        this.Value = v;
    }
    DisplayStr() {
        return this.Value;
    }
}

export class TokenChar implements TokenType {
    static Type = "Char";
    readonly Type = TokenChar.Type;
    Value: DSS.MyChar;
    DisplayStr() {
        return this.Value.DisplayStr();
    }
}


export class TokenString implements TokenType {
    static Type = "String";
    readonly Type = TokenString.Type;
    Value: DSS.MyString;
    constructor(v: string) {
        this.Value = new DSS.MyString;
        this.Value.Value = v;
    }
    DisplayStr() {
        return this.Value.DisplayStr();
    }
}

export class TokenBoolean implements TokenType {
    static Type = "Boolean";
    readonly Type = TokenBoolean.Type;
    readonly Value: MyBool;
    constructor(v: boolean) {
        this.Value = new MyBool(v);
    }
    DisplayStr() {
        return this.Value.DisplayStr();
    }
}

class complexPart {
    value: string;
    sign: number; // +|-
    suffix: string;
    constructor() {
        this.sign = 1;
        this.value = "";
        this.suffix = "";
    }
    generate(e: number, radix: number): { r: DSC.Real, e: boolean } {
        if (this.value.length === 0) {
            return { r: DSC.Real.MakeFromRational(DSC.Rational.MakeFromInteger(0, 1)), e: true };
        }
        let sn = this.suffix.length > 0 ? Number.parseInt(this.suffix) : 0;
        let exactness = e === 2 ? false : true;
        if (this.value.indexOf(".") !== -1) {
            let x = this.sign * Number.parseFloat(this.value);
            if (e === 1) { // force to Rational
                return { r: DSC.Real.MakeFromFloat(true, x), e: true };
            } else {
                return { r: DSC.Real.MakeFromFloat(false, x), e: false };
            }
        } else if (this.value.indexOf("/") !== -1) {
            let x = this.value.split("/")
            let numerator = Number.parseInt(x[0]);
            let denominator = Number.parseInt(x[1]);
            if (e === 2) {
                return { r: DSC.Real.MakeFromFloat(false, numerator / denominator), e: false };
            } else {
                return { r: DSC.Real.MakeFromRational(DSC.Rational.MakeFromInteger(numerator, denominator)), e: true };
            }
        } else {
            let x = this.sign * Number.parseInt(this.value) * Math.pow(10, sn);
            if (e === 1) {
                return { r: DSC.Real.MakeFromFloat(true, x), e: true };
            } else if (e === 2) {
                return { r: DSC.Real.MakeFromFloat(false, x), e: false };
            } else {
                if (sn < 0) {
                    return { r: DSC.Real.MakeFromFloat(false, x), e: false };
                } else {
                    return { r: DSC.Real.MakeFromRational(DSC.Rational.MakeFromInteger(x, 1)), e: true };
                }
            }
        }
    }
}
export class TokenComplex implements TokenType {
    static Type = "Complex";
    readonly Type = TokenComplex.Type;
    Value: DSC.Complex;
    Radix: number;
    Exactness: number; // 0??????,1 ????????????, 2 ???????????????
    Part: number; // ????????????????????????
    Real: complexPart;
    UnReal: complexPart;

    constructor() {
        this.Radix = 10;
        this.Exactness = 0;
        this.Real = new complexPart();
        this.UnReal = new complexPart();
        this.Part = 0;
    }
    DisplayStr() {
        return this.Value.DisplayStr();
    }
    appendValue(cs: string) {
        if (this.Part === 0) {
            this.Real.value += cs;
        } else {
            this.UnReal.value += cs;
        }
    }
    appendSuffix(cs: string) {
        if (this.Part === 0) {
            this.Real.suffix += cs;
        } else {
            this.UnReal.suffix += cs;
        }
    }
    setSign(s: number) {
        if (this.Part === 0) {
            this.Real.sign = s;
        } else {
            this.UnReal.sign = s;
        }
    }
    generate() {
        let l = this.Real.generate(this.Exactness, this.Radix);
        let r = this.UnReal.generate(this.Exactness, this.Radix);
        let e = l.e && r.e;
        this.Value = new DSC.Complex();
        this.Value.RealPart = DSC.Real.MakeFromReal(e, l.r);
        this.Value.UnRealPart = DSC.Real.MakeFromReal(e, r.r);
    }
}

export class TokenIdentifier implements TokenType {
    static Type = "Identifier";
    readonly Type = TokenString.Type;
    Value: Identifier;
    constructor(v: string) {
        this.Value = new Identifier(v);
    }
    DisplayStr() {
        return this.Value.Value;
    }
}