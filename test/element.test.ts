import { expect } from 'chai'
import 'mocha'

import { FormElement, Field, Form } from '../src/form'

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
  
    it('should add a child after a certain element and set its parent accordingly.', () => {
      const root = new FormElement('root')
      const child1 = new FormElement('child1')
      const child2 = new FormElement('child2')
      const child3 = new FormElement('child3')
      const child4 = new FormElement('child4')

      root.add(child1, child2, child4)
  
      // Add the child to the root element. The parent of the child should be set afterwards.
      root.addAfter(child2, child3)

      expect(root.children).to.include(child3)
      expect(child3.parent).to.equal(root)
      expect(root.children.indexOf(child3)).to.equal(2)
    })
  
    it('should remove a child', function() {
      const root = new FormElement('root')
      const child1 = new FormElement('child1')
      const child2 = new FormElement('child2')
      const child3 = new FormElement('child3')
  
      root.add(
        child1, child2, child3
      )

      root.remove(child2)
  
      expect(root.children).to.include(child1)
      expect(root.children).to.not.include(child2)
      expect(root.children).to.include(child3)
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
  
      root.add(child1.add(child2))
  
      const found1 = root.find('child1')
      expect(found1).to.equal(child1)
  
      const found2 = root.find([ 'child1' ])
      expect(found2).to.equal(child1)
  
      const found3 = root.find('wrongName')
      expect(found3).to.equal(undefined)
  
      const found4 = root.find([ 'wrongName' ])
      expect(found4).to.equal(undefined)
  
      const found5 = root.find('')
      expect(found5).to.equal(undefined)
  
      const found6 = root.find([])
      expect(found6).to.equal(undefined)
  
      const found7 = root.find('child1.child2')
      expect(found7).to.equal(child2)
  
      const found8 = root.find([ 'child1', 'child2' ])
      expect(found8).to.equal(child2)
  
      const found9 = root.find('wrongName.child2')
      expect(found9).to.equal(undefined)
  
      const found10 = root.find([ 'wrongName', 'child2' ])
      expect(found10).to.equal(undefined)
  
      const found11 = root.find('child1.wrongName')
      expect(found11).to.equal(undefined)
  
      const found12 = root.find([ 'child1', 'wrongName' ])
      expect(found12).to.equal(undefined)
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
  
      root.add(
        child1.add( // gap
          child11.add(
            child111,
            child112.add( // gap -> no gap -> gap
              child1121
            )
          ),
          child12.add( // gap -> gap
            child121.add(
              child1211,
              child111Duplicate
            )
          )  
        ),
      )

      // find child with a one level gap
      const found1 = root.find('child11')
      expect(found1).to.equal(child11)
  
      // do not find child with a not existing name in the beginning of the path
      const found2 = root.find('wrongName.child11')
      expect(found2).to.equal(undefined)
  
      // do not find child with a not existing name in the end of the path
      const found3 = root.find('child11.wrongName')
      expect(found3).to.equal(undefined)
  
      // find a direct sub child of a child which is after a gap
      const found4 = root.find('child11.child111')
      expect(found4).to.equal(child111)
  
      // do not find a direct sub child of a child which is after a gap but which has a wrong name between the child and its sub child
      const found5 = root.find('child11.wrongName.child111')
      expect(found5).to.equal(undefined)
  
      // do not find a direct sub child of a child which is after a gap but which has a wrong name at the end
      const found6 = root.find('child12.child111.wrongName')
      expect(found6).to.equal(undefined)
  
      // find a child which comes after two gaps
      const found7 = root.find('child121')
      expect(found7).to.equal(child121)
  
      // find a direct sub child of a child which is after two gaps
      const found8 = root.find('child121.child1211')
      expect(found8).to.equal(child1211)
  
      // do not find a dislocated child which got accidentally put into another branch
      const found9 = root.find('child1111')
      expect(found9).to.equal(undefined)
    })
  
    it('should find a child if the path is not complete', function() {
      const root = new FormElement('root')
      const child1 = new FormElement('child1')
      const child11 = new FormElement('child11')
      const child111 = new FormElement('child111')
      const child1111 = new FormElement('child1111')
  
      root.add(
        child1.add(
          child11.add(
            child111.add(
              child1111
            )
          )
        )
      )

      let found1 = root.find('child11')
      expect(found1).to.equal(child11)
      
      let found2 = root.find('child111')
      expect(found2).to.equal(child111)

      let found3 = root.find('child1111')
      expect(found3).to.equal(child1111)

      let found4 = root.find('child1.child111')
      expect(found4).to.equal(child111)

      let found5 = root.find('child11.child111')
      expect(found5).to.equal(child111)

      let found6 = root.find('child1.child1111')
      expect(found6).to.equal(child1111)

      let found7 = root.find('child1.child11.child1111')
      expect(found7).to.equal(child1111)

      let found8 = root.find('child1.child111.child1111')
      expect(found8).to.equal(child1111)
    })  
  })
  
  describe('Test extending a form element', function() {
    it('Should include attached properties', function() {
      const element = new FormElement
      const validators = [ 1, 2, 3] 
      element.more.validators = validators

      expect(element.more.validators).to.exist
      expect(element.more.validators).to.equal(validators)
    })
  })

  describe('json', () => {
    it('should transfer all FormElement properties', () => {
      let formElement = new FormElement('testName')    
      let formElementObj = formElement.toObj()
  
      expect(formElementObj).to.deep.equal({
        '@class': 'FormElement',
        name: 'testName'
      })
      
      formElement.prototype = new FormElement('testSubName')
      formElementObj = formElement.toObj()
  
      expect(formElementObj).to.deep.equal({
        '@class': 'FormElement',
        name: 'testName',
        prototype: {
          '@class': 'FormElement',
          name: 'testSubName'
        }
      })
  
      formElement.more = {
        attribute1: 'attribute1',
        attribute2: 'attribute2'
      }
      
      formElementObj = formElement.toObj()
  
      expect(formElementObj).to.deep.equal({
        '@class': 'FormElement',
        name: 'testName',
        prototype: {
          '@class': 'FormElement',
          name: 'testSubName'
        },
        more: {
          attribute1: 'attribute1',
          attribute2: 'attribute2'
        }
      })
    })
  
    it('should transfer all Field properties', () => {
      let field = new Field()
      field.valueType = 'string'
      let fieldObj = field.toObj()
      
      expect(fieldObj).to.deep.equal({
        '@class': 'Field',
        'valueType': 'string'
      })
  
      field.value = 'testValue'
      fieldObj = field.toObj()
  
      expect(fieldObj).to.deep.equal({
        '@class': 'Field',
        valueType: 'string',
        value: 'testValue'
      })
  
      field.options = [ 1, 2, 3 ]
      fieldObj = field.toObj()
  
      expect(fieldObj).to.deep.equal({
        '@class': 'Field',
        valueType: 'string',
        value: 'testValue',
        options: [ 1, 2, 3 ]
      })    
    })
  
    it('should transfer all properties to FormElement', () => {
      let formElementObj = {
        '@class': 'FormElement',
        name: 'testName',
        prototype: {
          '@class': 'FormElement',
          'name': 'testSubName'
        },
        widget: {
          '@class': 'Widget',
          invisible: true
        },
        more: {
          attribute1: 'attribute1',
          attribute2: 'attribute2'
        }
      }
  
      let formElement = FormElement.fromObj(formElementObj)
  
      expect(formElement).to.be.instanceOf(FormElement)
      expect(formElement.name).to.equal('testName')
      expect(formElement.prototype).to.be.instanceOf(FormElement)
      expect(formElement.prototype.name).to.equal('testSubName')
      expect(formElement.widget).to.be.not.undefined
      expect(formElement.widget.invisible).to.equal(true)
      expect(formElement.more).to.be.not.undefined
      expect(formElement.more.attribute1).to.equal('attribute1')
      expect(formElement.more.attribute2).to.equal('attribute2')
    })
  
    it('should transfer all properties to Field', () => {
      let fieldObj = {
        '@class': 'Field',
        valueType: 'string',
        value: 'testValue',
        options: [ 'testValue1', 'testValue2']
      }
  
      let field = FormElement.fromObj(fieldObj)
  
      expect(field).to.be.instanceOf(Field)
      expect(field.valueType).to.equal('string')
      expect(field.value).to.equal('testValue')
      expect(field.options).to.deep.equal([ 'testValue1', 'testValue2'])
    })
  })

  it('should keep the specified elements', function() {
    let form = new Form().add(
      new Field('string', 'field1'),
      new Field('string', 'field2'),
      new FormElement('formElement1')
    )

    form.keep('field1')

    expect(form.find('field1')).to.be.not.undefined
    expect(form.find('field2')).to.be.undefined
    expect(form.find('formElement1')).to.be.undefined

    form = new Form().add(
      new Field('string', 'field1'),
      new FormElement('formElement1').add(
        new Field('string', 'field2')
      ),
      new FormElement('formElement2')
    )

    form.keep('field1')
    
    expect(form.find('field1')).to.be.not.undefined
    expect(form.find('formElement1')).to.be.undefined
    expect(form.find('field2')).to.be.undefined
    expect(form.find('formElement2')).to.be.undefined

    form = new Form().add(
      new Field('string', 'field1'),
      new FormElement('formElement1').add(
        new Field('string', 'field2')
      ),
      new FormElement('formElement2')
    )
    
    form.keep('field2')

    expect(form.find('field1')).to.be.undefined
    expect(form.find('formElement1')).to.be.not.undefined
    expect(form.find('field2')).to.be.not.undefined   
    expect(form.find('formElement2')).to.be.undefined
  })
})
