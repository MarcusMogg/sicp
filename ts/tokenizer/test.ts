import * as fs from "fs/promises"
import * as path from "path"

import { Tokenizer } from "./parse"
import { TokenType } from "./toke_type"

function walk(cp: string, walkfunc: (string) => void) {
    fs.stat(cp).then(
        stats => {
            if (stats.isDirectory()) {
                fs.readdir(cp).then(x => {
                    x.forEach(item => walk(path.join(cp, item), walkfunc));
                })
            } else if (stats.isFile()) {
                walkfunc(cp)
            }
        }
    )
}

let walkfunc = async (cur) => {
    let token = await fs.readFile(cur, 'utf8').then(
        x => Tokenizer(x)
    )
    let f = await fs.open(`logs/${path.basename(cur)}`, "w+");
    f.close();
    try {
        for (let t = token.next(); !t.done; t = token.next()) {
            await fs.appendFile(`logs/${path.basename(cur)}`, (t.value as TokenType).DisplayStr() + "\n")
        }
    } catch (e) {
        console.log(cur);
        console.log(`${cur}:${e}`)
    }
}

walk("static/test", walkfunc);