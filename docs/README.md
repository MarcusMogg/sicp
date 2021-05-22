---
home: true
title: 首页

actions:
  - text: sicp解题集
    link: /chap1/
    type: primary
  - text: scheme解释器实现
    link: /syntax/
    type: secondary
footer: MIT Licensed | Copyright © 2021-present MoggMa
---

### 尝试一下

斐波那契递归版

```scheme
(define (fib n)
  (cond ((= n 0) 0)
        ((= n 1) 1)
        (else (+ (fib (- n 1))
                 (fib (- n 2))))))

(fib 3)
```

<div>
    <button @click="runBase('1')">运行</button>
    <button @click="runSub('1')">代换</button>
    <button @click="clear('1')">清除</button>
</div>
<pre> {{msg[1]}} </pre>


斐波那契迭代版

```scheme
(define (fib-iter a b count)
        (if (= count 0)
            b
            (fib-iter (+ a b) a (- count 1))))

(define (fib2 n)
    (fib-iter 1 0 n))

(fib2 3)
```

<div>
    <button @click="runBase('2')">运行</button>
    <button @click="runSub('2')">代换</button>
    <button @click="clear('2')">清除</button>
</div>
<pre> {{msg[2]}} </pre>




<script>
import { run } from "@/ts/main";
import { baseEnv } from "@/ts/core/apply";

export default {
  data() {
    return {
      msg: {
        1:``,2:``,
      },
      env: baseEnv(),
      codes: {
        1:`
(define (fib n)
  (cond ((= n 0) 0)
        ((= n 1) 1)
        (else (+ (fib (- n 1))
                 (fib (- n 2))))))

(fib 3)
`,2:`
(define (fib-iter a b count)
        (if (= count 0)
            b
            (fib-iter (+ a b) a (- count 1))))

(define (fib2 n)
    (fib-iter 1 0 n))

(fib2 3)
`,
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
