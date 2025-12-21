const items = ["apple", "banana", "cherry"]

for (const item of items) {
  console.log(item)
}

async function fetchData(url: string): Promise<string> {
  const response = await fetch(url)
  return await response.text()
}

function safeDivide(a: number, b: number): number {
  try {
    if (b === 0) {
      throw new Error("Division by zero")
    }
    return a / b
  }
  catch (error) {
    console.log("Error occurred")
    return 0
  }
  finally {
    console.log("Done")
  }
}

let result = safeDivide(10, 2)
console.log(result)

let flag = true && false || true
console.log(flag)
