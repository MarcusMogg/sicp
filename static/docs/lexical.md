# My SICP

语法参考 [R5RS](https://schemers.org/Documents/Standards/R5RS/)， 但并不是完整实现

## BNF

使用BNF描述语法

使用一下拓展语法来简化书写：

- `<thing>*`​ 表示`<thing>` 重复0次或者多次
- `<thing>+`​ 表示`<thing>` 出现至少一次
- `<Any>` 表示任意字符

##  Token 解析

```cpp
<token> ::= <identifier> |  <boolean> | <number> 
              | <character> | <string> | '(' | ')'
              | ',' | " ' " | '.' 

<delimiter> := <whitespace> | '(' | ')' | '"'
<whitespace> := space | newline
```

## 注释

```cpp
<comment> ::= ';'<any>*
```

## 标识符

```cpp
<identifier> ::= <initial> <subsequent>* | <peculiar identifier>

<initial> ::= <letter> | <special initial>
<letter> ::= 'a' | 'b' | ... | 'z' | 
		   'A' | 'B' | ... | 'Z' 
<special initial> ::= '!' | '$' | '%' | '&' | '*' | '/ '| ':' | '< '| '=' | '>' | '?' | '^'|'_' | '~'

<subsequent> ::= <initial> | <digit> | <special subsequent>
<digit> ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
<special subsequent> ::= '+' | '-' | '.' | '@'

<peculiar identifier> ::= '+' | '-' | '...'
```

注意peculiar identifier指 `+`,`-`,`...`不是省略号

## Boolean

```
<boolean> ::= #t | #f
```

## Number

```c
<number> ::= <num 2> | <num 8> | <num 10> | <num 16>

<num R> ::= <prefix R><complex R>

<complex R>::= <real R> | <real R> '@' <real R>
			| <real R> '+' <ureal R> 'i' | <real R> '-' <ureal R>'i'
			| <real R> '+' 'i' | <real R> '-' 'i'
			//| '+' <ureal R> 'i' | '-' <ureal R> 'i'

<real R> ::= <sign> <ureal R>
<sign>::= <empty> | '+' | '-'
<ureal R> ::= <uinteger R> 
			|<uinteger R>  '/'  <uinteger R> 
			|<decimal R>
<uinteger R> ::= <digit R>+
<decimal 10> ::= <uinteger 10> <suffix> 
    			| <digit 10>+'.'<digit R>+ <suffix> 
    		// | '.'<digit 10>+ <suffix> 
    		// | <digit 10>+'.'<digit R>* <suffix> 
<suffix> ::= <empty> | 'e' <sign> <digit 10>+
    
<prefix R> ::= <radix R> <exactness> 
    		| <exactness> <radix R> 
<exactness> ::= <empty> | '#i' | '#e'
<radix 2> ::= '#b'
<radix 8> ::= '#o'
<radix 10> ::= '#d' | <empty>
<radix 16> ::= '#x'
<digit 2> ::=  0 | 1 | 2
<digit 8> ::=  0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 
<digit 10> ::= <digit>
<digit 16> ::= <digit 10> | 'a' | 'b' |  'c' | 'd' | 'e' | 'f'
```

删除了r5rs里面 `#`当0的用法和 除了e之外的后缀

scheme 的数字系统比较复杂，分为四类  

- complex 复数
- real 实数
- rational 有理数
- integer 整数

其中，整数和有理数是精确的`#e`,其他是不精确的`#i`

精确数之间的运算保证结果仍然是精确的，有不精确数参与的运算最后是不精确的

FIXME:这里有问题, 如何表示实数 比如 sqrt(#e4) = #e2 sqrt(#e3) = 1.7xxxx

## Char

```cpp
<character> ::= #\ <any character> 
    		  |#\ <character name>
<character name> ::= 'space' | 'newline'
```

## String

```
<string> ::= " <string element>* "
<string element> ::= 除了"和\之外的所有字符
```

## keyword

```
quote | lambda | if | set | begin | cond | and | or | case | let | let* | letrec | do | delay | quasiquote | else | => | define | unquote | unquote-splicing
```



