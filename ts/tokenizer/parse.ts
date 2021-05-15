import { DFAState } from "./dfs_state"
import * as Token from "./toke_type"

const special = ['!', '$', '%', '&', '*', '/', ':', '<', '=', '>', '?', '^', '_', '~'];
const specialSubs = ['+', '-', '.', '@'];
const digit: Map<number, string[]> = new Map([
    [2, ["0", "1"]],
    [8, ["0", "1", "2", "3", "4", "5", "6", "7"]],
    [10, ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]],
    [16, ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"]]
]);
const delimiter = [" ", "\t", "\n", "(", ")", "\"", "\t", ""];
const escapeChar = new Map([
    ["a", "\a"], ["b", "\b"], ["n", "\n"], ["r", "\r"], ["v", "\v"], ["\\", "\\"], ["'", "'"], ["\"", "\""],]);
function find(arr: Array<string>, input: string) {
    return arr.find(x => x === input) !== undefined;
}
function isLetter(input: string) {
    return /^[a-zA-Z]$/.test(input);
}
function idSubsequent(input: string) {
    return isLetter(input) || find(special, input) || find(digit.get(10), input) || find(specialSubs, input);
}

function* reader(input: string) {
    for (const iterator of input) {
        yield iterator;
    }
}
function dfaInitial(input: string): DFAState {
    switch (input) {
        case "": return DFAState.Final;
        case " ":
        case "\t":
        case "\n":
        case "\r": return DFAState.Initial;
        case "(": return DFAState.BracketsLeftRound;
        case ")": return DFAState.BracketsRightRound;
        case ";": return DFAState.Comment;
        case ",": return DFAState.Comma;
        case ".": return DFAState.Dot;
        case "'": return DFAState.Apostrophe;
        case "\"": return DFAState.StringBegin;
        case "#": return DFAState.Hash;
        case "+":
        case "-": return DFAState.Sign;
        default:
            if (isLetter(input) || find(special, input)) {
                return DFAState.IdInit;
            }
            if (find(digit.get(10), input)) {
                return DFAState.UrealR;
            }
            return DFAState.Fail;
    }
}
export function* Tokenizer(input: string) {
    let r = reader(input);
    let state = DFAState.Initial;
    let row = 1, col = 1;
    let cur: IteratorResult<string, void>;
    let next = () => {
        if (state === DFAState.Fail || state === DFAState.Final) {
            return;
        }
        cur = r.next();
        if (!cur.done) {
            if (cur.value == "\n") {
                row++; col = 1;
            } else {
                col++;
            }
        }
    }
    next();
    let token: Token.TokenType = undefined;
    //try {
    for (; ;) {
        let cs = cur.done ? "" : cur.value as string;
        switch (state) {
            case DFAState.Initial:
                state = dfaInitial(cs);
                if (state === DFAState.Sign || state === DFAState.IdInit) {
                    token = new Token.TokenIdentifier(cs);
                } else if (state === DFAState.UrealR) {
                    token = new Token.TokenComplex();
                    (token as Token.TokenComplex).appendValue(cs);
                }
                next();
                break;
            case DFAState.BracketsLeftRound:
                token = new Token.TokenBracketsLeftRound();
                state = DFAState.End;
                break;
            case DFAState.BracketsRightRound:
                token = new Token.TokenBracketsRightRound();
                state = DFAState.End;
                break;
            case DFAState.Comma:
                token = new Token.TokenComma();
                state = DFAState.End;
                break;
            case DFAState.Dot:
                if (find(delimiter, cs)) {
                    token = new Token.TokenDot();
                    state = DFAState.End;
                } else if (cs === ".") {
                    state = DFAState.Dot3;
                    next();
                } else {
                    state = DFAState.Fail;
                }
                break;
            case DFAState.Dot3:
                if (cs === ".") {
                    next();
                    token = new Token.TokenDot3();
                    state = DFAState.End;
                } else {
                    state = DFAState.Fail;
                }
                break;
            case DFAState.Apostrophe:
                token = new Token.TokenApostrophe();
                state = DFAState.End;
                break;
            case DFAState.Comment:
                if (token === undefined) {
                    token = new Token.TokenComment("");
                }
                if (cs === "\n" || cs === "") {
                    state = DFAState.End;
                } else {
                    (token as Token.TokenComment).Value += cs;
                }
                next();
                break;
            case DFAState.StringBegin:
                if (token === undefined) {
                    token = new Token.TokenString("");
                }
                if (cs === "\\") {
                    state = DFAState.StringEscape;
                } else if (cs === "\"") {
                    state = DFAState.End;
                } else {
                    (token as Token.TokenString).Value.Value += cs;
                }
                next();
                break;
            case DFAState.StringEscape:
                if (escapeChar.has(cs)) {
                    (token as Token.TokenString).Value.Value += escapeChar.get(cs);
                    next();
                    state = DFAState.StringBegin;
                } else {
                    state = DFAState.Fail;
                }
                break;
            case DFAState.Hash:
                switch (cs) {
                    case "t":
                        token = new Token.TokenBoolean(true);
                        state = DFAState.Boolean;
                        break;
                    case "f":
                        token = new Token.TokenBoolean(false);
                        state = DFAState.Boolean;
                        break;
                    case "\\":
                        token = new Token.TokenChar();
                        state = DFAState.CharBegin;
                        break;
                    case "e":
                    case "i":
                        token = new Token.TokenComplex();
                        state = DFAState.Exactness1;
                        if (cs === "i") {
                            (token as Token.TokenComplex).Exactness = 2;
                        } else {
                            (token as Token.TokenComplex).Exactness = 1;
                        }
                        break;
                    case "b":
                    case "o":
                    case "d":
                    case "x":
                        token = new Token.TokenComplex();
                        state = DFAState.Radix1;
                        if (cs === "b") {
                            (token as Token.TokenComplex).Radix = 2;
                        } else if (cs === "o") {
                            (token as Token.TokenComplex).Radix = 8;
                        } else if (cs === "x") {
                            (token as Token.TokenComplex).Radix = 16;
                        }
                        break;
                    default:
                        state = DFAState.Fail;
                        break;
                }
                next();
                break;
            case DFAState.Boolean:
                if (find(delimiter, cs)) {
                    state = DFAState.End;
                } else {
                    state = DFAState.Fail;
                }
                break;
            case DFAState.CharBegin:
                token.Value = cs;
                next();
                if (find(delimiter, cs)) {
                    state = DFAState.End;
                } else {
                    if (cs === "s" || cs === "n") {
                        state = DFAState.CharEscape;
                    } else {
                        state = DFAState.Fail;
                    }
                }
                break;
            case DFAState.CharEscape:
                const need = token.Value === "s" ? "pace" : "ewline";
                for (const iterator of need) {
                    if (cs !== iterator) {
                        state = DFAState.Fail;
                        break;
                    }
                    next();
                    cs = cur.done ? "" : cur.value as string;
                }
                if (find(delimiter, cs)) {
                    state = DFAState.Fail;
                }
                if (state !== DFAState.Fail) {
                    token.Value = token.Value === "s" ? " " : "\n";
                    state = DFAState.End;
                }
                break;
            case DFAState.Radix1:
                switch (cs) {
                    case "#":
                        state = DFAState.Radix2;
                        break;
                    case "+":
                    case "-":
                        if (cs === "-") {
                            (token as Token.TokenComplex).setSign(-1);
                        }
                        state = DFAState.SignInit;
                        break;
                    default:
                        if (find(digit.get((token as Token.TokenComplex).Radix), cs)) {
                            (token as Token.TokenComplex).appendValue(cs);
                            state = DFAState.UrealR;
                        } else {
                            state = DFAState.Fail;
                        }
                        break;
                }
                next();
                break;
            case DFAState.Radix2:
                switch (cs) {
                    case "e":
                    case "i":
                        state = DFAState.Prefix;
                        if (cs === "i") {
                            (token as Token.TokenComplex).Exactness = 2;
                        } else {
                            (token as Token.TokenComplex).Exactness = 1;
                        }
                        break;
                    default:
                        state = DFAState.Fail;
                        break;
                }
                break;
            case DFAState.Exactness1:
                switch (cs) {
                    case "#":
                        state = DFAState.Exactness2;
                        break;
                    case "+":
                    case "-":
                        if (cs === "-") {
                            (token as Token.TokenComplex).setSign(-1);
                        }
                        state = DFAState.SignInit;
                        break;
                    default:
                        if (find(digit.get((token as Token.TokenComplex).Radix), cs)) {
                            (token as Token.TokenComplex).appendValue(cs);
                            state = DFAState.UrealR;
                        } else {
                            state = DFAState.Fail;
                        }
                        break;
                }
                next();
                break;
            case DFAState.Exactness2:
                switch (cs) {
                    case "b":
                    case "o":
                    case "d":
                    case "x":
                        state = DFAState.Prefix;
                        if (cs === "b") {
                            (token as Token.TokenComplex).Radix = 2;
                        } else if (cs === "o") {
                            (token as Token.TokenComplex).Radix = 8;
                        } else if (cs === "x") {
                            (token as Token.TokenComplex).Radix = 16;
                        }
                        break;
                    default:
                        state = DFAState.Fail;
                        break;
                }
                break;
            case DFAState.Prefix:
                switch (cs) {
                    case "+":
                    case "-":
                        if (cs === "-") {
                            (token as Token.TokenComplex).setSign(-1);
                        }
                        state = DFAState.SignInit;
                        break;
                    default:
                        if (find(digit.get((token as Token.TokenComplex).Radix), cs)) {
                            (token as Token.TokenComplex).appendValue(cs);
                            state = DFAState.UrealR;
                        } else {
                            state = DFAState.Fail;
                        }
                        break;
                }
                next();
                break;
            case DFAState.SignInit:
                if (find(digit.get((token as Token.TokenComplex).Radix), cs)) {
                    (token as Token.TokenComplex).appendValue(cs);
                    state = DFAState.UrealR;
                    next();
                } else {
                    state = DFAState.Fail;
                }
                break;
            case DFAState.Sign:
                if (find(delimiter, cs)) {
                    state = DFAState.End;
                } else if (find(digit.get(10), cs)) {
                    let s = token.Value;
                    token = new Token.TokenComplex();
                    if (s === "-") {
                        (token as Token.TokenComplex).setSign(-1);
                    }
                    (token as Token.TokenComplex).appendValue(cs);
                    state = DFAState.UrealR;
                    next();
                } else {
                    state = DFAState.Fail;
                }
                break;
            case DFAState.UrealR:
                if (find(delimiter, cs)) {
                    state = DFAState.End;
                } else {
                    if (find(digit.get((token as Token.TokenComplex).Radix), cs)) {
                        (token as Token.TokenComplex).appendValue(cs);
                        state = DFAState.UrealR;
                    } else if (cs === "/") {
                        (token as Token.TokenComplex).appendValue(cs);
                        state = DFAState.UintegerRB;
                    } else if (cs === "+" || cs === "-" || cs === "@") {
                        if ((token as Token.TokenComplex).Part === 0) {
                            (token as Token.TokenComplex).Part = 1;
                            if (cs === "-")
                                (token as Token.TokenComplex).setSign(-1);
                            state = DFAState.Complex;
                        } else {
                            state = DFAState.Fail;
                        }
                    } else if (cs === "e") {
                        if ((token as Token.TokenComplex).Radix !== 10) {
                            state = DFAState.Fail;
                        } else {
                            (token as Token.TokenComplex).appendValue(cs);
                            state = DFAState.SuffixE;
                        }
                    } else if (cs === ".") {
                        if ((token as Token.TokenComplex).Radix !== 10) {
                            (token as Token.TokenComplex).appendValue(cs);
                            state = DFAState.Fail;
                        } else {
                            (token as Token.TokenComplex).appendValue(cs);
                            state = DFAState.DecimalB;
                        }
                    } else if (cs === "i") {
                        if ((token as Token.TokenComplex).Part === 1) {
                            state = DFAState.End;
                        } else {
                            state = DFAState.Fail;
                        }
                    } else {
                        state = DFAState.Fail;
                    }
                    next();
                }
                break;
            case DFAState.UintegerRB:
                if (find(digit.get((token as Token.TokenComplex).Radix), cs)) {
                    (token as Token.TokenComplex).appendValue(cs);
                    state = DFAState.UintegerRE;
                } else {
                    state = DFAState.Fail;
                }
                next();
                break;
            case DFAState.UintegerRE:
                if (find(delimiter, cs)) {
                    state = DFAState.End;
                } else if (find(digit.get((token as Token.TokenComplex).Radix), cs)) {
                    (token as Token.TokenComplex).appendValue(cs);
                    state = DFAState.UintegerRE;
                    next();
                } else if (cs === "+" || cs === "-" || cs === "@") {
                    if ((token as Token.TokenComplex).Part === 0) {
                        (token as Token.TokenComplex).Part = 1;
                        if (cs === "-")
                            (token as Token.TokenComplex).setSign(-1);
                        state = DFAState.Complex;
                        next();
                    } else {
                        state = DFAState.Fail;
                    }
                } else if (cs === "e") {
                    if ((token as Token.TokenComplex).Radix !== 10) {
                        state = DFAState.Fail;
                    } else {
                        (token as Token.TokenComplex).appendValue(cs);
                        state = DFAState.SuffixE;
                        next();
                    }
                } else if (cs === "i") {
                    if ((token as Token.TokenComplex).Part === 1) {
                        state = DFAState.End;
                        next();
                    } else {
                        state = DFAState.Fail;
                    }
                } else {
                    state = DFAState.Fail;
                }
                break;
            case DFAState.DecimalB:
                if (find(digit.get(10), cs)) {
                    (token as Token.TokenComplex).appendValue(cs);
                    state = DFAState.UintegerRE;
                } else {
                    state = DFAState.Fail;
                }
                next();
                break;
            case DFAState.DecimalE:
                if (find(delimiter, cs)) {
                    state = DFAState.End;
                } else if (find(digit.get((token as Token.TokenComplex).Radix), cs)) {
                    (token as Token.TokenComplex).appendValue(cs);
                    state = DFAState.UintegerRE;
                    next();
                } else if (cs === "+" || cs === "-" || "@") {
                    if ((token as Token.TokenComplex).Part === 0) {
                        (token as Token.TokenComplex).Part = 1;
                        if (cs === "-")
                            (token as Token.TokenComplex).setSign(-1);
                        state = DFAState.Complex;
                        next();
                    } else {
                        state = DFAState.Fail;
                    }
                } else if (cs === "e") {
                    state = DFAState.SuffixE;
                    next();
                } else {
                    state = DFAState.Fail;
                }
                break;
            // case DFAState.SuffixB:
            //     if (cs === "e") {
            //         state = DFAState.SuffixE;
            //     } else {
            //         state = DFAState.Fail;
            //     }
            //     next();
            //     break;
            case DFAState.SuffixE:
                if (find(digit.get(10), cs)) {
                    (token as Token.TokenComplex).appendSuffix(cs);
                    state = DFAState.SuffixNum;
                } else if (cs === "+" || cs === "-") {
                    (token as Token.TokenComplex).appendSuffix(cs);
                    state = DFAState.SuffixSign;
                } else {
                    state = DFAState.Fail;
                }
                next();
                break;
            case DFAState.SuffixNum:
                if (find(delimiter, cs)) {
                    state = DFAState.End;
                } else if (find(digit.get(10), cs)) {
                    (token as Token.TokenComplex).appendSuffix(cs);
                    state = DFAState.SuffixNum;
                    next();
                } else if (cs === "+" || cs === "-" || "@") {
                    if ((token as Token.TokenComplex).Part === 0) {
                        (token as Token.TokenComplex).Part = 1;
                        if (cs === "-")
                            (token as Token.TokenComplex).setSign(-1);
                        state = DFAState.Complex;
                        next();
                    } else {
                        state = DFAState.Fail;
                    }
                } else {
                    state = DFAState.Fail;
                }
                break;
            case DFAState.SuffixSign:
                if (find(digit.get(10), cs)) {
                    (token as Token.TokenComplex).appendSuffix(cs);
                    state = DFAState.SuffixNum;
                } else {
                    state = DFAState.Fail;
                }
                next();
                break;
            case DFAState.Complex:
                if (find(digit.get((token as Token.TokenComplex).Radix), cs)) {
                    (token as Token.TokenComplex).appendValue(cs);
                    state = DFAState.UrealR;
                } else if (cs === "i") {
                    (token as Token.TokenComplex).appendValue("1");
                    state = DFAState.End;
                } else {
                    state = DFAState.Fail;
                }
                next();
                break;
            case DFAState.IdInit:
                if (find(delimiter, cs)) {
                    state = DFAState.End;
                } else if (idSubsequent(cs)) {
                    (token as Token.TokenIdentifier).Value.Value += cs;
                    state = DFAState.IdInit;
                    next();
                } else {
                    state = DFAState.Fail;
                }
                break;
            case DFAState.End:
                if (token.Type === Token.TokenComplex.Type) {
                    (token as Token.TokenComplex).generate();
                }
                yield token;
                token = undefined;
                state = DFAState.Initial;
            default:
                break;
        }
        if (state === DFAState.Fail) {
            throw new Error(`editor:${row}:${col}: read-syntax:`);
        } else if (state === DFAState.Final) {
            break;
        }
    }
    //} catch (e) {
    //    throw new Error(`editor:${row}:${col}: convert error:`);
    //}
}
