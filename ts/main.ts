import { SimpleEnv } from "./environment/env_base";
import * as fs from "fs/promises"
import * as path from "path"
import { Tokenizer } from "./tokenizer/parse";
import { parse } from "./expression/datum";
import { Eval } from "./core/eval";
import { DS } from "./basic_ds/bs";
import { baseEnv } from "./core/apply";

let e = baseEnv();
let cur = "static/test/basic_test";
fs.readFile(cur, 'utf8').
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
            res.push(Eval(i, e));
        }
        return res;
    }).
    then(x => x.map(xx => xx !== undefined && console.log(xx.DisplayStr()))).
    catch(e => {
        console.log(e);
    })