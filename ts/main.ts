import { SimpleEnv } from "./environment/env_base";
import * as fs from "fs/promises"
import * as path from "path"
import { Tokenizer } from "./tokenizer/parse";
import { parse } from "./expression/datum";
import { Eval } from "./core/eval";
import { DS } from "./basic_ds/bs";
import { baseEnv } from "./core/apply";

export class Output {
    private cur_: DS;
    private static instance: Output;
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
        if (this.cur_ !== undefined) {
            console.log(this.cur_.DisplayStr());
        }
    }
    display(s: string) {
        process.stdout.write(s);
    }
    replace(target: any, source: any, show = true) {
        Object.assign(target, source);
        Object.setPrototypeOf(target, Object.getPrototypeOf(source));
        if (show) this.subShow()
    }
};
let e = baseEnv();
let basic = "static/test/basic_test";
let sub = "static/test/substitution_test"
fs.readFile(sub, 'utf8').
    then(x => Tokenizer(x)).
    then(x => {
        let res = new Array<DS>();
        while (true) {
            let tmp = parse(x);
            if (tmp === undefined) {
                break;
            }
            res.push(tmp);
        }
        //console.log(res);
        return res;
    }).
    then(x => {
        let res = new Array<DS>();
        for (const i of x) {
            Output.getInstance().subModel(i);
            Output.getInstance().subShow();
            res.push(Eval(i, e));
            Output.getInstance().display("\n");
        }
        return res;
    }).
    then(x => x.map(xx => xx !== undefined
        //&& console.log(xx.DisplayStr())
    )).
    catch(e => {
        console.log(e);
    })