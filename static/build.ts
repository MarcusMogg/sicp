import * as fs from "fs/promises"
import * as path from "path"

const button = (index: number) => {
  return `
<div>
    <button @click="runBase('${index}')">运行</button>
    <button @click="runSub('${index}')">代换</button>
    <button @click="clear('${index}')">清除</button>
</div>
<pre> {{msg[${index}]}} </pre>

`
}

const temp = (cd: Array<string>) => {
  if (cd.length <= 0) return "";

  let msg = "";
  let codes = "";

  for (let key = 0; key < cd.length; key++) {
    msg += `${key + 1}:\`\`,`;
    codes += `${key + 1}:\`${cd[key]}\`,`;
  }

  return `

<script>
import { run } from "@/ts/main";
import { baseEnv } from "@/ts/core/apply";

export default {
  data() {
    return {
      msg: {
        ${msg}
      },
      env: baseEnv(),
      codes: {
        ${codes}
      },
    };
  },
  created() {},
  methods: {
    runBase(name) {
      this.clear(name);
      let str = this.codes[name];
      let display = (str) => {
        this.msg[name] = this.msg[name] + str;
      };
      run(str,display,false,this.env)
    },
    runSub(name) {
      this.clear(name);
      let str = this.codes[name];
      let display = (str) => {
        this.msg[name] = this.msg[name] + str;
      };
      run(str,display,true,this.env)
    },
    clear(name) {
      this.msg[name] = "";
    },
  },
};
</script>
`
}

const tarPath = "../docs/";
const srcPath = path.resolve("docs");


function save(data: string, dst: string) {
  let filename = path.join(tarPath, path.resolve(dst).replace(srcPath, ""));
  fs.writeFile(filename, data, { flag: 'w+' })
    .catch(e => console.log(e))
}

function walk(filePath: string, walkfunc: (string) => void) {
  fs.stat(filePath)
    .then(stats => {
      if (stats.isDirectory()) {
        fs.readdir(filePath)
          .then(arr => arr.forEach(
            item => {
              walk(path.join(filePath, item), walkfunc)
            }))
      } else if (stats.isFile()) {
        walkfunc(filePath)
      }
    })
    .catch(e => console.log(e))
}

function filter(data: string) {
  const reg = /```scheme([\s\S]*?)```[\s]?/g;
  // const res = [...data.matchAll(reg)]
  let codes = new Array<string>();
  // for (const iterator of res) {

  data = data.replace(reg, (a, b) => {
    codes.push(b);
    return a + button(codes.length)
  });
  //  }
  data += temp(codes);
  return data;
}

function walkfunc(cur: string) {
  fs.readFile(cur, 'utf8')
    .then(data => filter(data))
    .then(data => save(data, cur))
    .catch(e => console.log(e))
}

walk(srcPath, walkfunc);