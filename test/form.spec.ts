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
    const oldRoot = new FormElement
    const newRoot = new FormElement
    const child = new FormElement

    child.parent = oldRoot

    expect(child.parent).to.equal(oldRoot)
    expect(oldRoot.children).to.include(child)

    child.parent = newRoot

    expect(child.parent).to.equal(newRoot)
    expect(newRoot.children).to.include(child)
    expect(oldRoot.children).to.not.include(child)
  })
  
})

describe('Test the functionality associated to the name', () => {

  it('should create the correct path', () => {
    const root = new FormElement('root')
    const childWithName = new FormElement('childWithName')
    const childWithoutName = new FormElement()
    const childWithEmptyName = new FormElement('')

    root.add(childWithName)
    root.add(childWithoutName)
    root.add(childWithEmptyName)

    expect(childWithName.path).to.equal('root.childWithName')
    expect(childWithoutName.path).to.equal('')
    expect(childWithEmptyName.path).to.equal('')
  })
  
  it('should create the correct path in the third level', () => {
    const root = new FormElement('root')
    const childWithName1 = new FormElement('childWithName1')
    const childWithoutName1 = new FormElement()
    const childWithEmptyName1 = new FormElement('')
    const childWithName2 = new FormElement('childWithName2')
    const childWithoutName2 = new FormElement()
    const childWithEmptyName2 = new FormElement('')

    root.add(childWithName1)
    root.add(childWithoutName1)
    root.add(childWithEmptyName1)

    childWithName1.add(childWithName2)
    childWithName1.add(childWithoutName2)
    childWithName1.add(childWithEmptyName2)

    expect(childWithName2.path).to.equal('root.childWithName1.childWithName2')
    expect(childWithoutName2.path).to.equal('')
    expect(childWithEmptyName2.path).to.equal('')

    childWithoutName1.add(childWithName2)
    childWithoutName1.add(childWithoutName2)
    childWithoutName1.add(childWithEmptyName2)

    expect(childWithName2.path).to.equal('root.childWithName2')
    expect(childWithoutName2.path).to.equal('')
    expect(childWithEmptyName2.path).to.equal('')

    childWithEmptyName1.add(childWithName2)
    childWithEmptyName1.add(childWithoutName2)
    childWithEmptyName1.add(childWithEmptyName2)

    expect(childWithName2.path).to.equal('root.childWithName2')
    expect(childWithoutName2.path).to.equal('')
    expect(childWithEmptyName2.path).to.equal('')
  })
  
  it('should find a child by name', () => {
    const root = new FormElement('root')
    const child = new FormElement('child')

    root.add(child)

    const foundChild1 = root.find('child')
    expect(foundChild1).to.equal(child)

    const foundChild2 = root.find([ 'child' ])
    expect(foundChild2).to.equal(child)

    const foundChild3 = root.find('wrongName')
    expect(foundChild3).to.equal(null)

    const foundChild4 = root.find([ 'wrongName' ])
    expect(foundChild4).to.equal(null)

    const foundChild5 = root.find('')
    expect(foundChild5).to.equal(null)

    const foundChild6 = root.find([])
    expect(foundChild6).to.equal(null)
  })

  it('should find a child by name in the third level', () => {
    const root = new FormElement('root')
    const child1 = new FormElement('child1')
    const child2 = new FormElement('child2')

    root.add(child1)
    child1.add(child2)

    const foundChild1 = root.find('child1.child2')
    expect(foundChild1).to.equal(child2)

    const foundChild2 = root.find([ 'child1', 'child2' ])
    expect(foundChild2).to.equal(child2)

    const foundChild3 = root.find('wrongName.child2')
    expect(foundChild3).to.equal(null)

    const foundChild4 = root.find([ 'wrongName', 'child2' ])
    expect(foundChild4).to.equal(null)

    const foundChild5 = root.find('child1.wrongName')
    expect(foundChild5).to.equal(null)

    const foundChild6 = root.find([ 'child1', 'wrongName' ])
    expect(foundChild6).to.equal(null)
  })

})