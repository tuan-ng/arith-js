# INTERPRETING AND COMPILING AN ARITHMETIC LANGUAGE

This post illustrates writing an interpreter and a compiler using 
Javascript. We will be interpreting and compiling an arithmetic 
language where we can add, multiply, subtract, and divide 
integers. 

To start, we need to decide how we'll write the arithmetic expressions. 
We'll use Scheme notations (Scheme is a beautiful programming language).
Here are a few examples: 

```scheme
(+ 1 2 3)                 ; 6
(* 1 (/ 9 3))             ; 3 
(* 1 (+ 2 3 4) 5 (- 6 7)) ; -45
9                         ; 9
```

The first expression evaluates to `6`, it's really equivalent 
to writing `1 + 2 + 3`. The second expression evaluates to 
`3`, it's equivalent to `1 * (9 / 3)`. The last expression 
evaluates to itself. 

Each expression will be read in as a string that needs to be 
tokenized and parsed. Thus we'll write four little programs: 

1. The tokenizer
2. The parser 
3. The interpreter
4. The compiler 

### The Tokenizer 
Our arithmetic language is made up of either `(`, `)`, numbers, or 
one of the four operations `+`, `-`, `*`, `/`. We'll break a given 
string into a list of these. The easiest way is to add some spaces 
to both sides of each bracket `(` and `)`, make sure there's no 
leading or trailing spaces, and then split by spaces. So we may 
write: 

```javascript
const tokenize = s => s.replace(/\(/g, ' ( ')
                       .replace(/\)/g, ' ) ')
                       .trim()
                       .split(/\s+/);
```

### The Parser
The parser is a bit more complicated. We need to analyze carefully 
the syntactic structure of our arithmetic language. It is either a 
number or an operation (both of which are called atoms) or a 
parenthesized expression (a compound expression). 
We'll assume that an expression is fully correct, e.g. there're no 
missing brackets or no unknown 
symbols. Here are a few examples of how our parser will behave: 

```javascript 
parse(tokenize("-10"));                    // -10
parse(tokenize("(+ 1 2 (+ 3 4 5))"));      // [ '+', 1, 2, [ '+', 3, 4, 5 ] ]
parse(tokenize("(/ 1 2 4 (- 5 6) 7 8)"));  // [ '/', 1, 2, 4, [ '-', 5, 6 ], 7, 8 ]
```

The basic idea is as follows. If we see an open bracket, we need to parse 
a compound expression, otherwise we parse an atom. Parsing an atom means 
parsing one of the four arithmetic expressions or parsing a number. 
Parsing a compound expression means parsing until we see a closed bracket, but 
if we see an open bracket in the process we need to start parsing a new 
compound expression again. Thus recursion is involved, and some bookkeeping
of consuming and peeking is also needed. Please note that peeking means 
just seeing the current character, while consuming means parsing the current 
character and advancing to the next one. 

The parser is shown below. Please note that we're using Javascript integers as 
the integers in our arithmetic language. 


```javascript
const parse = tokens => {

  let i = 0;
  const peek = () => tokens[i];
  const consume = () => tokens[i++];
  
  const parseAtom = () => (
    /^[+*-\/]$/.test(peek()) ? consume() : parseInt(consume())
  );

  const parseCompound = () => {
    consume();
    const v = [];
    let c = peek();
    while (c != ')') {
      if (c != '(') {
        v.push(parseAtom());
      } else {
        v.push(parseCompound());
      }
      c = peek();
    }
    if (c == ')') consume();
    return v;
  };
  return peek() == '(' ? parseCompound() : parseAtom();
}
```

### The Interpreter
To interpret an arithmetic expression means to evaluate it.  If we 
see a number, we should return it; otherwise we evaluate the arguments 
and then apply the operator to the arguments. 

The interpreter is shown below. 


```javascript
const interpret = tree => {
  if (typeof tree == 'number') return tree;
  const [op, ...args] = tree 
  const vals =  args.map(arg => interpret(arg));
  switch (op) {
    case '+': return vals.reduce((a,b) => a+b, 0);
    case '*': return vals.reduce((a,b) => a*b, 1);
    case '-': return vals.reduce((a,b) => a-b);
    case '/': return vals.reduce((a,b) => a / b);
  };
};
```

### The Compiler 
To compile an arithmetic expression into Javascript means to return 
a string that would evaluate in Javascript to the same value with that 
of the original expression. For example, 

```javascript
interpret(parse(tokenize("(* 2 3 (+ 1 1) (/ 6 3) 1)")));      // -24 
eval(compile(parse(tokenize("(* 2 3 (+ 1 1) (/ 6 3) 1)"))));  // -24 
```

The compiler is shown below. 

```javascript
const compile = tree => {
  if (typeof tree == 'number') return tree.toString();
  const [op, ...args] = tree;
  return `( ${args.map(arg => compile(arg)).join(' ' + op + ' ')} )`;
};
```
