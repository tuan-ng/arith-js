const { tokenize, parse, interpret, compile } = require("./arith");

test("tokenize (+ 1 2 3)", () => {
  expect(tokenize("(+ 1 2 3)")).toEqual(["(", "+", "1", "2", "3", ")"]);
});

test("tokenize (* -1 2 (/ 9 (+ 1 2)))", () => {
  expect(tokenize("(* -1 2 (/ 9 (+ 1 2)))")).toEqual([
    "(",
    "*",
    "-1",
    "2",
    "(",
    "/",
    "9",
    "(",
    "+",
    "1",
    "2",
    ")",
    ")",
    ")"
  ]);
});

test("parse tokenize((+ -1 2 (* 1 3 5)))", () => {
  expect(parse(tokenize("(+ -1 2 (* 1 3 5))"))).toEqual([
    "+",
    -1,
    2,
    ["*", 1, 3, 5]
  ]);
});

test("interpret parse(tokenize((+ -1 2 (* 1 3 5))))", () => {
  expect(interpret(parse(tokenize("(+ -1 2 (* 1 3 5))")))).toBe(16);
});

test("compile parse(tokenize((+ -1 2 (* 1 3 5))))", () => {
  expect(compile(parse(tokenize("(+ -1 2 (* 1 3 5))")))).toEqual(
    "( -1 + 2 + ( 1 * 3 * 5 ) )"
  );
});
