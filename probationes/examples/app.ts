// User management application - TypeScript equivalent

class User {
    name: string
    age: number
    active: boolean = true

    canVote(): boolean {
        return this.age >= 18 && this.active
    }

    greet(): string {
        return `Salve, ${this.name}!`
    }
}

function validateAge(age: number): boolean {
    if (age < 0) {
        return false
    }
    else if (age > 150) {
        return false
    }
    else {
        return true
    }
}

function processUsers(users: User[]): number {
    let count = 0

    for (const user of users) {
        if (user.active) {
            console.log(user.greet())
            count = count + 1
        }
    }

    return count
}

function findOldest(users: User[]): User | null {
    if (users.length === 0) {
        return null
    }

    let oldest = users[0]

    for (const user of users) {
        if (user.age > oldest.age) {
            oldest = user
        }
    }

    return oldest
}

function safeDivide(a: number, b: number): number {
    try {
        if (b === 0) {
            throw "Division by zero"
        }
        return a / b
    }
    catch (err) {
        console.log("Error:", err)
        return 0
    }
}

const users = [
    new User({ name: "Marcus", age: 25 }),
    new User({ name: "Julia", age: 17 }),
    new User({ name: "Claudia", age: 42, active: false }),
    new User({ name: "Augustus", age: 33 })
]

console.log("Processing users...")
const activeCount = processUsers(users)
console.log(`Active users: ${activeCount}`)

const oldest = findOldest(users)
if (oldest !== null) {
    console.log("Oldest user:", oldest.name, oldest.age)
}

let total = 0
for (const user of users) {
    if (user.canVote()) {
        console.log(`${user.name} can vote`)
        total = total + 1
    }
}

console.log("Eligible voters:", total)

const avg = safeDivide(total, users.length)
console.log("Average eligibility:", avg)
