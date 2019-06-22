import { expect } from 'chai'
import 'mocha'

import { FormElement } from '../src/form'

describe('Test handling of children', () => {

  it('should add a child and set its parent accordingly.', () => {
    const rootElement = new FormElement
    const child = new FormElement

    // Add the child to the root element. The parent of the child should be set afterwards.
    rootElement.add(child)

    expect(rootElement.children).to.include(child)
    expect(child.parent).to.equal(rootElement)
  })

  it('should add an element which parent is set to that parent\'s children.', () => {
    const rootElement = new FormElement
    const child = new FormElement

    // Set the parent of the child. The root element should include the child afterwards.
    child.parent = rootElement

    expect(child.parent).to.equal(rootElement)
    expect(rootElement.children).to.include(child)
  })

  it('should remove a child if its parent is set to null', () => {
    const rootElement = new FormElement
    const child = new FormElement

    child.parent = rootElement

    expect(child.parent).to.equal(rootElement)
    expect(rootElement.children).to.include(child)

    child.parent = null

    expect(child.parent).to.equal(null)
    expect(rootElement.children).to.not.include(child)
  })

  it('should add a child to its new parent and remove it from the old one', () => {
    const oldRootElement = new FormElement
    const newRootElement = new FormElement
    const child = new FormElement

    child.parent = oldRootElement

    expect(child.parent).to.equal(oldRootElement)
    expect(oldRootElement.children).to.include(child)

    child.parent = newRootElement

    expect(child.parent).to.equal(newRootElement)
    expect(newRootElement.children).to.include(child)
    expect(oldRootElement.children).to.not.include(child)
  })
  
})
