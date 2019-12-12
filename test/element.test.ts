import { expect } from 'chai'
import 'mocha'

import { FormElement, Field } from '../src/form'

describe('FormElement', function() {
  describe('children', function() {

    it('should add a child and set its parent accordingly.', () => {
      const root = new FormElement('root')
      const child = new FormElement('child')
  
      // Add the child to the root element. The parent of the child should be set afterwards.
      root.add(child)
  
      expect(root.children).to.include(child)
      expect(child.parent).to.equal(root)
    })
  
    it('should add an element which parent is set to that parent\'s children.', function() {
      const root = new FormElement('root')
      const child = new FormElement('child')
  
      // Set the parent of the child. The root element should include the child afterwards.
      child.parent = root
  
      expect(child.parent).to.equal(root)
      expect(root.children).to.include(child)
    })
  
    it('should remove a child if its parent is set to undefined', function() {
      const root = new FormElement('root')
      const child = new FormElement('child')
  
      child.parent = root
  
      expect(child.parent).to.equal(root)
      expect(root.children).to.include(child)
  
      child.parent = undefined
  
      expect(child.parent).to.equal(undefined)
      expect(root.children).to.not.include(child)
    })
  
    it('should add a child to its new parent and remove it from the old one', function() {
      const oldRoot = new FormElement('oldRoot')
      const newRoot = new FormElement('newRoot')
      const child = new FormElement('child')
  
      child.parent = oldRoot
  
      expect(child.parent).to.equal(oldRoot)
      expect(oldRoot.children).to.include(child)
  
      child.parent = newRoot
  
      expect(child.parent).to.equal(newRoot)
      expect(newRoot.children).to.include(child)
      expect(oldRoot.children).to.not.include(child)
    })
  
    it('should determine the root correctly', function() {
      const root = new FormElement('root')
      const child1 = new FormElement('child1')
      const child2 = new FormElement('child2')
  
      root.add(child1)
      child1.add(child2)
  
      expect(root.root).to.equal(root)
      expect(child1.root).to.equal(root)
      expect(child2.root).to.equal(root)
  
      child1.parent = undefined
  
      expect(child1.root).to.equal(child1)
      expect(child2.root).to.equal(child1)
    })
  
    it('should handle setting an array of children correctly', function() {
      const root = new FormElement('root')
      const child1 = new FormElement('child1')
      const child2 = new FormElement('child2')
      const children1 = [ child1, child2 ]
  
      root.children = children1
  
      expect(child1.parent).to.equal(root)
      expect(child2.parent).to.equal(root)
      
      const child3 = new FormElement('child3')
      const child4 = new FormElement('child4')
      const children2 = [ child3, child4 ]
  
      root.children = children2
  
      expect(child1.parent).to.equal(undefined)
      expect(child2.parent).to.equal(undefined)
      expect(child3.parent).to.equal(root)
      expect(child4.parent).to.equal(root)
    })
    
    it('should retreive all fields', function() {
      let root = new FormElement('root').add(
        new FormElement(),
        new Field(),
        new FormElement(),
        new Field()
      )

      let fields = root.fields

      expect(fields.length).to.equal(2)
    })
  })
  
  describe('path', function() {
  
    it('should create the correct path', function() {
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
    
    it('should create the correct path in the third level', function() {
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
  
  })
  
  describe('Test find', function() {
    
    it('should find a child by name', function() {
      const root = new FormElement('root')
      const child1 = new FormElement('child1')
      const child2 = new FormElement('child2')
  
      root.add(child1)
      child1.add(child2)
  
      const foundChild1 = root.find('child1')
      expect(foundChild1).to.equal(child1)
  
      const foundChild2 = root.find([ 'child1' ])
      expect(foundChild2).to.equal(child1)
  
      const foundChild3 = root.find('wrongName')
      expect(foundChild3).to.equal(undefined)
  
      const foundChild4 = root.find([ 'wrongName' ])
      expect(foundChild4).to.equal(undefined)
  
      const foundChild5 = root.find('')
      expect(foundChild5).to.equal(undefined)
  
      const foundChild6 = root.find([])
      expect(foundChild6).to.equal(undefined)
  
      const foundChild7 = root.find('child1.child2')
      expect(foundChild7).to.equal(child2)
  
      const foundChild8 = root.find([ 'child1', 'child2' ])
      expect(foundChild8).to.equal(child2)
  
      const foundChild9 = root.find('wrongName.child2')
      expect(foundChild9).to.equal(undefined)
  
      const foundChild10 = root.find([ 'wrongName', 'child2' ])
      expect(foundChild10).to.equal(undefined)
  
      const foundChild11 = root.find('child1.wrongName')
      expect(foundChild11).to.equal(undefined)
  
      const foundChild12 = root.find([ 'child1', 'wrongName' ])
      expect(foundChild12).to.equal(undefined)
    })
  
    it('should find a child even when there is a gap in the path', function() {
      const root = new FormElement('root')
      const child1 = new FormElement // gap
      const child11 = new FormElement('child11') // element after one gape
      const child111 = new FormElement('child111') // sub element of element after one gap
      const child112 = new FormElement // gap -> no gap -> gap
      const child1121 = new FormElement('child1121') // element after two gaps
      const child12 = new FormElement // gap -> gap
      const child121 = new FormElement('child121') // element after two gaps
      const child1211 = new FormElement('child1211') // sub element of element after two gaps
      const child111Duplicate = new FormElement('child111') // duplicate element in different branch of the tree
  
      root.add(child1)
      child1.add(child11)
      child11.add(child111)
      child11.add(child112)
      child112.add(child1121)
      child1.add(child12)
      child12.add(child121)
      child121.add(child1211)
      child121.add(child111Duplicate)
  
      // find child with a one level gap
      const foundChild1 = root.find('child11')
      const foundChild2 = root.find([ 'child11' ])
      expect(foundChild1).to.equal(child11)
      expect(foundChild2).to.equal(child11)
  
      // do not find child with a not existing name in the beginning of the path
      const foundChild3 = root.find('wrongName.child11')
      const foundChild4 = root.find([ 'wrongName' , 'child11' ])
      expect(foundChild3).to.equal(undefined)
      expect(foundChild4).to.equal(undefined)
  
      // do not find child with a not existing name in the end of the path
      const foundChild5 = root.find('child11.wrongName')
      const foundChild6 = root.find([ 'child11' , 'wrongName' ])
      expect(foundChild5).to.equal(undefined)
      expect(foundChild6).to.equal(undefined)
  
      // find a direct sub child of a child which is after a gap
      const foundChild7 = root.find('child11.child111')
      const foundChild8 = root.find([ 'child11', 'child111' ])
      expect(foundChild7).to.equal(child111)
      expect(foundChild8).to.equal(child111)
  
      // do not find a direct sub child of a child which is after a gap but which has a wrong name between the child and its sub child
      const foundChild9 = root.find('child11.wrongName.child111')
      const foundChild10 = root.find([ 'child11', 'wrongName', 'child111' ])
      expect(foundChild9).to.equal(undefined)
      expect(foundChild10).to.equal(undefined)
  
      // do not find a direct sub child of a child which is after a gap but which has a wrong name at the end
      const foundChild11 = root.find('child12.child111.wrongName')
      const foundChild12 = root.find([ 'child12', 'child111', 'wrongName' ])
      expect(foundChild11).to.equal(undefined)
      expect(foundChild12).to.equal(undefined)
  
      // find a child which comes after two gaps
      const foundChild15 = root.find('child121')
      const foundChild16 = root.find([ 'child121' ])
      expect(foundChild15).to.equal(child121)
      expect(foundChild16).to.equal(child121)
  
      // find a direct sub child of a child which is after two gaps
      const foundChild17 = root.find('child121.child1211')
      const foundChild18 = root.find([ 'child121', 'child1211' ])
      expect(foundChild17).to.equal(child1211)
      expect(foundChild18).to.equal(child1211)
  
      // do not find a dislocated child which got accidentally put into another branch
      const foundChild19 = root.find('child1111')
      const foundChild20 = root.find([ 'child1111' ])
      expect(foundChild19).to.equal(undefined)
      expect(foundChild20).to.equal(undefined)
    })
  
  })
  
  describe("Test extending a form element", function() {
    it("Should include attached properties", function() {
      const element = new FormElement
      const validators = [ 1, 2, 3] 
      element.more.validators = validators
  
      expect(element.more.validators).to.exist
      expect(element.more.validators).to.equal(validators)
    })
  })
})
