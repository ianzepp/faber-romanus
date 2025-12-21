const name: string = "Marcus"
let count: number = 0

function greet(person: string): string {
  return "Salve, " + person
}

console.log(greet(name))

if (count == 0) {
  console.log("Zero")
}
else {
  console.log("Not zero")
}

while (count < 3) {
  console.log(count)
  count = count + 1
}
