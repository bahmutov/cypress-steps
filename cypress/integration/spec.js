/// <reference types="cypress" />

beforeEach(() => {
  Cypress.env('steps', [])
})

Cypress.on('command:end', (c) => {
  const MAX_STEPS = 5
  const steps = Cypress.env('steps')
  if (steps.length > MAX_STEPS) {
    steps.shift()
  }
  const { name, subject, args } = c.attributes

  const argsStr = JSON.stringify(args)
  const subjectStr = Cypress._.isPlainObject(subject)
    ? JSON.stringify(subject)
    : subject

  steps.push(`${name} ${argsStr} => ${subjectStr}`)
})

const createCustomErrorMessage = (error, steps, runnableObj) => {
  // Let's generate the list of steps from an array of strings
  let lastSteps = 'Last logged steps:\n'
  steps.map((step, index) => {
    lastSteps += `${index + 1}. ${step}\n`
  })

  // I decided to keep the following as an array
  //   for easier customization. But basically in the end
  //   I'll be building the text from the array by combining those
  //   and adding new line at the end
  const messageArr = [
    `Context: ${runnableObj.parent.title}`, // describe('...')
    `Test: ${runnableObj.title}`, // it('...')
    `----------`,
    `${error.message}`, // actual Cypress error message
    `\n${lastSteps}`, // additional empty line to get some space
    //   and the list of steps generated earlier
  ]

  // Return the new custom error message
  return messageArr.join('\n')
}

Cypress.on('fail', (err, runnable) => {
  debugger
  const customErrorMessage = createCustomErrorMessage(
    err,
    Cypress.env('steps') || ['no steps provided...'],
    runnable,
  )

  err.message = customErrorMessage
  throw err
})

it('works', () => {
  cy.wrap({ name: 'Joe' })
    .its('name')
    .should('equal', 'Joe')
    .invoke('split', '')
    .invoke('reverse')
    .invoke('join', '')
    .should('equal', 'Mary')
})
