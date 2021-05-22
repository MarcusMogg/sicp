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

