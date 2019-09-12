// An interpreter and a compiler for an arithmetic 
// language. See README for more detail. 

const tokenize = s => s.replace(/\(/g, ' ( ')
                       .replace(/\)/g, ' ) ')
                       .trim()
                       .split(/\s+/);

const parse = tokens => {

  let i = 0;
  const peek = () => tokens[i];
  const consume = () => tokens[i++];
  
  const parseAtom = () => (
    /[+*-\/]/.test(peek()) ? consume() : parseInt(consume())
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

const compile = tree => {
  if (typeof tree == 'number') return tree.toString();
  const [op, ...args] = tree;
  return `( ${args.map(arg => compile(arg)).join(' ' + op + ' ')} )`;
};

