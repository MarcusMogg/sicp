export enum DFAState {
    Initial = 1,
    // Punctuation
    BracketsLeftRound,           // (
    BracketsRightRound,          // )
    Comma,                       // ,
    Apostrophe,                  // '
    Dot,                         // .
    Dot3,                        // ...
    // Comment
    Comment,                     // ; xxxx
    // String
    StringBegin,                 // "xxx"
    StringEscape,                // \n
    // # 
    Hash,                       // # 
    // bool
    Boolean,                    // #t, #f
    // char
    CharBegin,                  // #\
    CharEscape,                 // #\s
    // number
    Radix1,                     // #b|d|o|x
    Radix2,                     // #b|d|o|x# only except i|e
    Exactness1,                 // #i|e
    Exactness2,                 // #i|e# only except b|d|o|x
    Prefix,                     // #i#b | #b#i
    SignInit,                   // +|- from Prefix or Radix1 or Exactness1
    Sign,                       // +|- from initial
    UrealR,                     // digit R
    UintegerRB,                 // a/
    UintegerRE,                 // a/b
    DecimalB,                   // a.
    DecimalE,                   // a.b
    SuffixB,                    // # 
    SuffixE,                    // #e
    SuffixNum,                  // #e12
    SuffixSign,                 // #e+|-

    Complex,                    // Real+|-

    // identifier
    IdInit,                    // <letter> | <special initial>

    Fail,
    End,
    Final,
}