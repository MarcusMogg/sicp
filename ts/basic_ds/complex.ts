import { DS } from "./bs"
export class Rational {
    Numerator: number;
    Denominator: number;

    static MakeFromFloat(v: number): Rational {
        let res = new Rational()
        if (Number.isInteger(v)) {
            res.Numerator = v;
            res.Denominator = 1;
        } else {
            let sl = v.toString().split(".");
            res.Denominator = Math.pow(10, sl[1].length);
            res.Numerator = res.Denominator * Number.parseInt(sl[0])
                + Number.parseInt(sl[1]);
            res.reduce();
        }
        return res;
    }
    static MakeFromInteger(n: number, d: number): Rational {
        let res = new Rational()
        res.Numerator = n;
        res.Denominator = d;
        return res;
    }
    static MakeFromRational(v: Rational): Rational {
        let res = new Rational();
        Object.assign(res, v);
        return res;
    }

    toNumber(): number {
        return this.Numerator / this.Denominator;
    }
    DisplayStr() {
        if (this.Denominator === 1 || this.Numerator === 0) {
            return `${this.Numerator}`;
        } else {
            return `${this.Numerator}/${this.Denominator}`;
        }
    }
    reduce() {
        if (this.Numerator === 0) {
            this.Denominator = 1;
            return;
        }
        let g = gcd(this.Numerator, this.Denominator);
        this.Denominator /= g;
        this.Numerator /= g;
    }
    plus(rhs: Rational) {
        this.Numerator *= rhs.Denominator;
        this.Numerator += rhs.Numerator * this.Denominator;
        this.Denominator *= rhs.Denominator;
        this.reduce();
    }
    minus(rhs: Rational) {
        this.Numerator *= rhs.Denominator;
        this.Numerator -= rhs.Numerator * this.Denominator;
        this.Denominator *= rhs.Denominator;
        this.reduce();
    }
    equal(rhs: Rational) {
        return this.Numerator === rhs.Numerator && this.Denominator === rhs.Denominator;
    }
}

export class Real {
    Value: number | Rational;

    static MakeFromFloat(e: boolean, v: number): Real {
        let res = new Real()
        if (e) {
            res.Value = Rational.MakeFromFloat(v);
        } else {
            res.Value = v;
        }
        return res;
    }
    static MakeFromRational(n: Rational): Real {
        let res = new Real()
        res.Value = n;
        return res;
    }
    static MakeFromReal(e: boolean, v: Real): Real {
        let res = new Real()
        if (e) {
            if (v.Value instanceof Rational) {
                res.Value = Rational.MakeFromRational(v.Value);
            } else {
                res.Value = Rational.MakeFromFloat(v.Value)
            }
        } else {
            if (v.Value instanceof Rational) {
                res.Value = v.Value.toNumber();
            } else {
                res.Value = v.Value;
            }
        }
        return res;
    }

    DisplayStr() {
        if (this.Value instanceof Rational) {
            return this.Value.DisplayStr();
        } else {
            return this.Value.toString();
        }
    }
    Zero() {
        if (this.Value instanceof Rational) {
            return this.Value.Numerator === 0;
        }
        return false;
    }

    toNumber(): number {
        if (this.Value instanceof Rational) {
            return this.Value.toNumber();
        } else {
            return this.Value;
        }
    }

    plus(rhs: Real) {
        if (this.Value instanceof Rational) {
            if (rhs.Value instanceof Rational) {
                this.Value.plus(rhs.Value);
            } else {
                this.Value = this.Value.toNumber() + rhs.toNumber()
            }
        } else {
            this.Value = this.Value + rhs.toNumber()
        }
    }
    minus(rhs: Real) {
        if (this.Value instanceof Rational) {
            if (rhs.Value instanceof Rational) {
                this.Value.minus(rhs.Value);
            } else {
                this.Value = this.Value.toNumber() - rhs.toNumber()
            }
        } else {
            this.Value = this.Value - rhs.toNumber()
        }
    }
    equal(rhs: Real) {
        if (this.Value instanceof Rational) {
            if (rhs.Value instanceof Rational) {
                return this.Value.equal(rhs.Value);
            } else {
                return this.Value.toNumber() === rhs.toNumber()
            }
        } else {
            return this.Value === rhs.toNumber()
        }
    }
}

export class Complex implements DS {
    static readonly Type = "Complex";
    readonly Type = Complex.Type;
    RealPart: Real
    UnRealPart: Real
    constructor() {
        this.RealPart = Real.MakeFromRational(Rational.MakeFromInteger(0, 1));
        this.UnRealPart = Real.MakeFromRational(Rational.MakeFromInteger(0, 1));
    }
    DisplayStr() {
        if (this.UnRealPart.Zero()) {
            return this.RealPart.DisplayStr();
        } else {
            let u = this.UnRealPart.DisplayStr();
            return `${this.RealPart.DisplayStr()}${u[0] === '-' ? u : `+${u}`}i`
        }
    }

    plus(rhs: Complex) {
        this.RealPart.plus(rhs.RealPart);
        this.UnRealPart.plus(rhs.UnRealPart);
    }
    minus(rhs: Complex) {
        this.RealPart.minus(rhs.RealPart);
        this.UnRealPart.minus(rhs.UnRealPart);
    }
    equal(rhs: Complex) {
        return this.RealPart.equal(rhs.RealPart)
            && this.UnRealPart.equal(rhs.UnRealPart);
    }
}

const gcd = (a: number, b: number): number => {
    if (a == 0) return b;
    return gcd(b % a, a);
}
