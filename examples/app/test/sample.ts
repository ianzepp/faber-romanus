const greeting: string = "Salve, Munde!"
console.log(greeting)

function add(a: number, b: number): number {
  return a + b
}

let sum = add(5, 3)
console.log(sum)

if (sum > 5) {
  console.log("Greater than five!")
}
