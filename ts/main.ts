import { Tokenizer } from "./tokenizer/parse";
import { parse } from "./expression/datum";
import { Eval } from "./core/eval";
import { DS } from "./basic_ds/bs";
import { Env } from "./environment/env_base";

export class Output {
    private cur_: DS;
    private static instance: Output;
    private display_: (msg: string) => void;
    private sub_: boolean;
    private constructor() {

    }

    public static getInstance() {
        if (!Output.instance) {
            Output.instance = new Output();
        }
        return Output.instance;
    }
    subModel(d: DS) {
        this.cur_ = d;
    }
    subShow() {
        if (this.sub_ && this.cur_ !== undefined) {
            this.display_(this.cur_.DisplayStr());
            this.display_("\n");
        }
    }
    display(s: string) {
        this.display_(s);
    }
    replace(target: any, source: any, show = true) {
        Object.assign(target, source);
        Object.setPrototypeOf(target, Object.getPrototypeOf(source));
        if (show) this.subShow()
    }
    setDisplay(f: (string) => void) {
        this.display_ = f;
    }
    setSub(s: boolean) {
        this.sub_ = s;
    }
};

export function run(str: string,
    display: (string) => void,
    sub: boolean,
    env: Env) {

    let t = Tokenizer(str);
    Output.getInstance().setDisplay(display);
    Output.getInstance().setSub(sub);

    try {
        while (true) {
            let tmp = parse(t);
            if (tmp === undefined) {
                break;
            }
            Output.getInstance().subModel(tmp);
            Output.getInstance().subShow();
            let res = Eval(tmp, env);
            if (res !== undefined) {
                Output.getInstance().display(res.DisplayStr());
            }
            Output.getInstance().display("\n");
        }
    } catch (e) {
        Output.getInstance().display(e);
    }
}

// let e = baseEnv();
// let basic = "static/test/basic_test";
// let sub = "static/test/substitution_test"
// fs.readFile(sub, 'utf8').
//     then(x => Tokenizer(x)).
//     then(x => {
//         let res = new Array<DS>();
//         while (true) {
//             let tmp = parse(x);
//             if (tmp === undefined) {
//                 break;
//             }
//             res.push(tmp);
//         }
//         //console.log(res);
//         return res;
//     }).
//     then(x => {
//         let res = new Array<DS>();
//         for (const i of x) {
//             Output.getInstance().subModel(i);
//             Output.getInstance().subShow();
//             res.push(Eval(i, e));
//             Output.getInstance().display("\n");
//         }
//         return res;
//     }).
//     then(x => x.map(xx => xx !== undefined
//         //&& console.log(xx.DisplayStr())
//     )).
//     catch(e => {
//         console.log(e);
//     })