# 标准过程

支持的内置过程

## Equivalence predicates

`(eq? obj1 obj2) ` 比较复杂……，简单来说就是基本类型判断值相等，复杂类型（列表）判断指针相等
`(equal? obj1 obj2) ` 判断obj1和obj2的displayStr是否相同

## number

`(number? obj) ` 

`(complex? obj) ` 

`(real? obj) ` 

`(rational? obj) ` 

`(integer? obj) ` 

` (= z1 z2 z3 ...) ` 

` (< x1 x2 x3 ...) ` 

` (> x1 x2 x3 ...) ` 

` (<= x1 x2 x3 ...) ` 

` (>= x1 x2 x3 ...) ` 

`(+ z1 ...)` 

`(* z1 ...)` 

`(- z1)` 

`(- z1 ...)` 

`(/ z1)` 

`(/ z1 ...)` 

 

only integer 

`(quotient n1 n2)` 

`(remainder n1 n2)` 

`(gcd n1 n2)` 

`(lcm n1 n2)` 


## boolean

`(not obj)` returns #t if obj is false, and returns #f otherwise.

and 和 no 不是函数

## pairs

`(pair? obj) `

`(cons obj1 obj2) `

`(car pair) `

`(cdr pair) `

`(null? obj) `

`(list? obj) `

`(list obj ...) `

## symbol

`(symbol? obj)`

