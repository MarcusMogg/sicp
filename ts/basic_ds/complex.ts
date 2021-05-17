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
        res.reduce();
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
        if (this.Denominator < 0) {
            this.Denominator *= -1;
            this.Numerator *= -1;
        }
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
    times(rhs: Rational) {
        this.Numerator *= rhs.Numerator;
        this.Denominator *= rhs.Denominator;
        this.reduce();
    }
    div(rhs: Rational) {
        this.Numerator *= rhs.Denominator;
        this.Denominator *= rhs.Numerator;
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
        return this.toNumber() === 0;
    }

    toNumber(): number {
        if (this.Value instanceof Rational) {
            return this.Value.toNumber();
        } else {
            return this.Value;
        }
    }
    toInt(): number {
        return Number.parseInt(this.toNumber().toString());
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
    equalS(rhs: Real) {
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
    equal(rhs: Real) {
        if (this.Value instanceof Rational) {
            if (rhs.Value instanceof Rational) {
                return this.Value.equal(rhs.Value);
            } else {
                return false;
            }
        } else {
            if (rhs.Value instanceof Rational) {
                return false;
            }
            return this.Value === rhs.toNumber()
        }
    }
    times(rhs: Real) {
        if (this.Value instanceof Rational) {
            if (rhs.Value instanceof Rational) {
                this.Value.times(rhs.Value);
            } else {
                this.Value = this.Value.toNumber() * rhs.toNumber()
            }
        } else {
            this.Value = this.Value * rhs.toNumber()
        }
    }
    div(rhs: Real) {
        if (this.Value instanceof Rational) {
            if (rhs.Value instanceof Rational) {
                this.Value.div(rhs.Value);
            } else {
                this.Value = this.Value.toNumber() / rhs.toNumber()
            }
        } else {
            this.Value = this.Value / rhs.toNumber()
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
    equal(rhs: DS) {
        if (rhs instanceof Complex) {
            return this.RealPart.equal(rhs.RealPart)
                && this.UnRealPart.equal(rhs.UnRealPart);
        }
        return false;
    }
    equalS(rhs: Complex) {
        return this.RealPart.equalS(rhs.RealPart)
            && this.UnRealPart.equalS(rhs.UnRealPart);
    }
    // FIXME: Maybe I need return a new Complex after operate
    times(rhs: Complex) {
        let tmp = new Complex(); tmp.plus(this);
        tmp.RealPart.times(rhs.RealPart);
        tmp.UnRealPart.times(rhs.UnRealPart);
        tmp.RealPart.minus(tmp.UnRealPart);

        this.RealPart.times(rhs.UnRealPart);
        this.UnRealPart.times(rhs.RealPart);
        this.UnRealPart.plus(this.RealPart);

        this.RealPart = tmp.RealPart;
    }
    div(rhs: Complex) {
        let t1 = Real.MakeFromFloat(true, 0); t1.plus(rhs.RealPart); t1.times(rhs.RealPart);
        let t2 = Real.MakeFromFloat(true, 0); t2.plus(rhs.UnRealPart); t2.times(rhs.UnRealPart);
        t1.plus(t2);

        let tmp = new Complex(); tmp.plus(this);
        tmp.RealPart.times(rhs.RealPart);
        tmp.UnRealPart.times(rhs.UnRealPart);
        tmp.RealPart.plus(tmp.UnRealPart);

        this.RealPart.times(rhs.UnRealPart);
        this.UnRealPart.times(rhs.RealPart);
        this.UnRealPart.minus(this.RealPart);

        this.RealPart = tmp.RealPart;
        this.RealPart.div(t1);
        this.UnRealPart.div(t1);
    }

    less(rhs: Complex): boolean {
        return this.RealPart.toNumber() < rhs.RealPart.toNumber()
            || (this.RealPart.toNumber() === rhs.RealPart.toNumber()
                && this.UnRealPart.toNumber() < rhs.UnRealPart.toNumber())
    }
    Copy(): DS {
        let res = new Complex();
        res.RealPart = this.RealPart;
        res.UnRealPart = this.UnRealPart;
        return res;
    }
}

export const gcd = (a: number, b: number): number => {
    if (a == 0) return b;
    return gcd(b % a, a);
}
