import { expect } from 'chai'
import 'mocha'

import { FormElement, Field, Option, Form } from '../src/form'

describe('Field', function() {
  describe('constructor', function() {
    it('should set the constructor parameters', function() {
      const options = [ new Option, new Option ]
      const field1 = new Field('boolean', 'field1', options)
      
      expect(field1.valueType).to.equal('boolean')
      expect(field1.name).to.equal('field1')
      expect(field1.options).to.equal(options)
      expect(field1.prototype).to.equal(undefined)
  
      const prototype = new FormElement('prototype')
      const field2 = new Field('object', 'field2', prototype)
  
      expect(field2.valueType).to.equal('object')
      expect(field2.name).to.equal('field2')
      expect(field2.prototype).to.equal(prototype)
      expect(field2.options.length).to.equal(0)
  
      const field3 = new Field('array', prototype)
      expect(field3.valueType).to.equal('array')
      expect(field3.name).to.equal(undefined)
      expect(field3.prototype).to.equal(prototype)
      expect(field3.options.length).to.equal(0)
  
      const field4 = new Field('number', options)
      expect(field4.valueType).to.equal('number')
      expect(field4.name).to.equal(undefined)
      expect(field4.options).to.equal(options)
      expect(field4.prototype).to.equal(undefined)
  
      const field5 = new Field('date', prototype, options)
      expect(field5.valueType).to.equal('date')
      expect(field5.name).to.equal(undefined)
      expect(field5.prototype).to.equal(prototype)
      expect(field5.options).to.equal(options)
  
      const field6 = new Field('string', options, prototype)
      expect(field6.valueType).to.equal('string')
      expect(field6.name).to.equal(undefined)
      expect(field6.options).to.equal(options)
      expect(field6.prototype).to.equal(prototype)
    })
  })
  
  describe('fieldPath', function() {
    it('should create the correct field path', function() {
      const root = new Field('string', 'root')
      const childWithName = new Field('string', 'childWithName')
      const childWithoutName = new Field('string')
      const childWithEmptyName = new Field('string', '')
  
      root.add(childWithName)
      root.add(childWithoutName)
      root.add(childWithEmptyName)
  
      expect(childWithName.fieldPath).to.equal('root.childWithName')
      expect(childWithoutName.fieldPath).to.equal('')
      expect(childWithEmptyName.fieldPath).to.equal('')
    })
    
    it('should create the correct field path in the third level', function() {
      const root = new Field('string', 'root')
      const childWithName1 = new Field('string', 'childWithName1')
      const childWithoutName1 = new Field('string')
      const childWithEmptyName1 = new Field('string', '')
      const childWithName2 = new Field('string', 'childWithName2')
      const childWithoutName2 = new Field('string')
      const childWithEmptyName2 = new Field('string', '')
  
      root.add(childWithName1)
      root.add(childWithoutName1)
      root.add(childWithEmptyName1)
  
      childWithName1.add(childWithName2)
      childWithName1.add(childWithoutName2)
      childWithName1.add(childWithEmptyName2)
  
      expect(childWithName2.fieldPath).to.equal('root.childWithName1.childWithName2')
      expect(childWithoutName2.fieldPath).to.equal('')
      expect(childWithEmptyName2.fieldPath).to.equal('')
  
      childWithoutName1.add(childWithName2)
      childWithoutName1.add(childWithoutName2)
      childWithoutName1.add(childWithEmptyName2)
  
      expect(childWithName2.fieldPath).to.equal('root.childWithName2')
      expect(childWithoutName2.fieldPath).to.equal('')
      expect(childWithEmptyName2.fieldPath).to.equal('')
  
      childWithEmptyName1.add(childWithName2)
      childWithEmptyName1.add(childWithoutName2)
      childWithEmptyName1.add(childWithEmptyName2)
  
      expect(childWithName2.fieldPath).to.equal('root.childWithName2')
      expect(childWithoutName2.fieldPath).to.equal('')
      expect(childWithEmptyName2.fieldPath).to.equal('')
    })
  
    it('should ignore elemets apart from fields', function() {
      const root = new Field('string', 'root')
      const element1 = new FormElement('element1')
      const field1 = new Field('string', 'field1')
      const element2 = new FormElement('element2')
      const field2 = new Field('string', 'field2')
  
      root.add(element1)
      element1.add(field1)
      field1.add(element2)
      element2.add(field2)
  
      expect(field1.fieldPath).to.equal('root.field1')
      expect(field2.fieldPath).to.equal('root.field1.field2')
    })
  })
  
  describe('findField', function() {
    it('should find a child by name', function() {
      const root = new Field('string', 'root')
      const child1 = new Field('string', 'child1')
      const child2 = new Field('string', 'child2')
  
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
  
    it('should find a child even when there is one gap in the path', function() {
      const root = new Field('string', 'root')
      const child1 = new Field('string')
      const child2 = new Field('string', 'child2')
      const child3 = new Field('string', 'child3')
  
      root.add(child1)
      child1.add(child2)
      child2.add(child3)
  
      const foundChild1 = root.findField('child2')
      const foundChild2 = root.findField([ 'child2' ])
  
      expect(foundChild1).to.equal(child2)
      expect(foundChild2).to.equal(child2)
  
      const foundChild3 = root.findField('child2.child3')
      const foundChild4 = root.findField([ 'child2' , 'child3' ])
  
      expect(foundChild3).to.equal(child3)
      expect(foundChild4).to.equal(child3)    
    })
  
    it('should find a child even when there is a gap in the path', function() {
      const root = new Field('string', 'root')
      const child1 = new Field // gap
      const child11 = new Field('string', 'child11') // element after one gap
      const child111 = new Field('string', 'child111') // sub element of element after one gap
      const child112 = new Field // gap -> no gap -> gap
      const child1121 = new Field('string', 'child1121') // element after two gaps
      const child12 = new Field // gap -> gap
      const child121 = new Field('string', 'child121') // element after two gaps
      const child1211 = new Field('string', 'child1211') // sub element of element after two gaps
      const child111Duplicate = new Field('string', 'child111') // duplicate element in different branch of the tree
  
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
      const foundChild1 = root.findField('child11')
      const foundChild2 = root.findField([ 'child11' ])
      expect(foundChild1).to.equal(child11)
      expect(foundChild2).to.equal(child11)
  
      // do not find child with a not existing name in the beginning of the path
      const foundChild3 = root.findField('wrongName.child11')
      const foundChild4 = root.findField([ 'wrongName' , 'child11' ])
      expect(foundChild3).to.equal(undefined)
      expect(foundChild4).to.equal(undefined)
  
      // do not find child with a not existing name in the end of the path
      const foundChild5 = root.findField('child11.wrongName')
      const foundChild6 = root.findField([ 'child11' , 'wrongName' ])
      expect(foundChild5).to.equal(undefined)
      expect(foundChild6).to.equal(undefined)
  
      // find a direct sub child of a child which is after a gap
      const foundChild7 = root.findField('child11.child111')
      const foundChild8 = root.findField([ 'child11', 'child111' ])
      expect(foundChild7).to.equal(child111)
      expect(foundChild8).to.equal(child111)
  
      // do not find a direct sub child of a child which is after a gap but which has a wrong name between the child and its sub child
      const foundChild9 = root.findField('child11.wrongName.child111')
      const foundChild10 = root.findField([ 'child11', 'wrongName', 'child111' ])
      expect(foundChild9).to.equal(undefined)
      expect(foundChild10).to.equal(undefined)
  
      // do not find a direct sub child of a child which is after a gap but which has a wrong name at the end
      const foundChild11 = root.findField('child12.child111.wrongName')
      const foundChild12 = root.findField([ 'child12', 'child111', 'wrongName' ])
      expect(foundChild11).to.equal(undefined)
      expect(foundChild12).to.equal(undefined)
  
      // find a child which comes after two gaps
      const foundChild15 = root.findField('child121')
      const foundChild16 = root.findField([ 'child121' ])
      expect(foundChild15).to.equal(child121)
      expect(foundChild16).to.equal(child121)
  
      // find a direct sub child of a child which is after two gaps
      const foundChild17 = root.findField('child121.child1211')
      const foundChild18 = root.findField([ 'child121', 'child1211' ])
      expect(foundChild17).to.equal(child1211)
      expect(foundChild18).to.equal(child1211)
  
      // do not find a dislocated child which got accidentally put into another branch
      const foundChild19 = root.findField('child1111')
      const foundChild20 = root.findField([ 'child1111' ])
      expect(foundChild19).to.equal(undefined)
      expect(foundChild20).to.equal(undefined)
    })
  
    it('should ignore non fields', function() {
      const root = new Field('string', 'root')
      const child1 = new FormElement // gap
      const child11 = new Field('string', 'child11') // element after one gape
      const child111 = new Field('string', 'child111') // sub element of element after one gap
      const child112 = new FormElement // gap -> no gap -> gap
      const child1121 = new Field('string', 'child1121') // element after two gaps
      const child12 = new FormElement // gap -> gap
      const child121 = new Field('string', 'child121') // element after two gaps
      const child1211 = new Field('string', 'child1211') // sub element of element after two gaps
      const child111Duplicate = new Field('string', 'child111') // duplicate element in different branch of the tree
  
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
      const foundChild1 = root.findField('child11')
      const foundChild2 = root.findField([ 'child11' ])
      expect(foundChild1).to.equal(child11)
      expect(foundChild2).to.equal(child11)
  
      // do not find child with a not existing name in the beginning of the path
      const foundChild3 = root.findField('wrongName.child11')
      const foundChild4 = root.findField([ 'wrongName' , 'child11' ])
      expect(foundChild3).to.equal(undefined)
      expect(foundChild4).to.equal(undefined)
  
      // do not find child with a not existing name in the end of the path
      const foundChild5 = root.findField('child11.wrongName')
      const foundChild6 = root.findField([ 'child11' , 'wrongName' ])
      expect(foundChild5).to.equal(undefined)
      expect(foundChild6).to.equal(undefined)
  
      // find a direct sub child of a child which is after a gap
      const foundChild7 = root.findField('child11.child111')
      const foundChild8 = root.findField([ 'child11', 'child111' ])
      expect(foundChild7).to.equal(child111)
      expect(foundChild8).to.equal(child111)
  
      // do not find a direct sub child of a child which is after a gap but which has a wrong name between the child and its sub child
      const foundChild9 = root.findField('child11.wrongName.child111')
      const foundChild10 = root.findField([ 'child11', 'wrongName', 'child111' ])
      expect(foundChild9).to.equal(undefined)
      expect(foundChild10).to.equal(undefined)
  
      // do not find a direct sub child of a child which is after a gap but which has a wrong name at the end
      const foundChild11 = root.findField('child12.child111.wrongName')
      const foundChild12 = root.findField([ 'child12', 'child111', 'wrongName' ])
      expect(foundChild11).to.equal(undefined)
      expect(foundChild12).to.equal(undefined)
  
      // find a child which comes after two gaps
      const foundChild15 = root.findField('child121')
      const foundChild16 = root.findField([ 'child121' ])
      expect(foundChild15).to.equal(child121)
      expect(foundChild16).to.equal(child121)
  
      // find a direct sub child of a child which is after two gaps
      const foundChild17 = root.findField('child121.child1211')
      const foundChild18 = root.findField([ 'child121', 'child1211' ])
      expect(foundChild17).to.equal(child1211)
      expect(foundChild18).to.equal(child1211)
  
      // do not find a dislocated child which got accidentally put into another branch
      const foundChild19 = root.findField('child1111')
      const foundChild20 = root.findField([ 'child1111' ])
      expect(foundChild19).to.equal(undefined)
      expect(foundChild20).to.equal(undefined)
    })
  })
  
  describe('set value', function() {
    it('should set primitive typed fields properly', function() {
      const booleanField = new Field('boolean')
      const dateField = new Field('date')
      const numberField = new Field('number')
      const stringField = new Field('string')
  
      // test boolean field
      booleanField.value = true
      expect(booleanField.value).to.equal(true)
      booleanField.value = false
      expect(booleanField.value).to.equal(false)
  
      // test date field
      const now = new Date
      dateField.value = now
      expect(dateField.value).to.equal(now)
  
      // test number field
      numberField.value = 9001
      expect(numberField.value).to.equal(9001)
  
      // test string field
      stringField.value = 'string'
      expect(stringField.value).to.equal('string')
    })
  
    it('should set any value even it is not the correct type', function() {
      const arrayField = new Field('array')
      const booleanField = new Field('boolean')
      const dateField = new Field('date')
      const numberField = new Field('number')
      const objectField = new Field('object')
      const stringField = new Field('string')
  
      // test array field
      arrayField.value = 'array'
      expect(arrayField.value).to.equal('array')
  
      // test boolean field
      booleanField.value = 'true'
      expect(booleanField.value).to.equal('true')
  
      // test date field
      dateField.value = 'now'
      expect(dateField.value).to.equal('now')
  
      // test number field
      numberField.value = '9001'
      expect(numberField.value).to.equal('9001')
  
      // test object field
      objectField.value = 'object'
      expect(objectField.value).to.equal('object')
  
      // test string field
      stringField.value = false
      expect(stringField.value).to.equal(false)
    })
  
    it('should create a child for every array item', function() {
      // test with primitive types
      const now = new Date
  
      const primitiveArray = [
        true, now, 4, 'string'
      ]
  
      const primitivePrototype = new Field()
      const primitiveArrayField = new Field('array', primitivePrototype)
      primitiveArrayField.value = primitiveArray
  
      expect((<Field> primitiveArrayField.children[0]).value).to.equal(true)
      expect((<Field> primitiveArrayField.children[1]).value).to.equal(now)
      expect((<Field> primitiveArrayField.children[2]).value).to.equal(4)
      expect((<Field> primitiveArrayField.children[3]).value).to.equal('string')
  
      // test with array type
      const arrayArray = [
        [ true, now, 4, 'string' ]
      ]
  
      const arrayPrototype = new Field('array', primitivePrototype)
      const arrayArrayField = new Field('array', arrayPrototype)
      arrayArrayField.value = arrayArray
  
      expect(arrayArrayField.value).to.equal(arrayArray)
      expect((<Field> arrayArrayField.children[0]).value).to.equal(arrayArray[0])
      expect((<Field> arrayArrayField.children[0].children[0]).value).to.equal(true)
      expect((<Field> arrayArrayField.children[0].children[1]).value).to.equal(now)
      expect((<Field> arrayArrayField.children[0].children[2]).value).to.equal(4)
      expect((<Field> arrayArrayField.children[0].children[3]).value).to.equal('string')
      
      // test with object type
      const objectArray = [
        { property: 'test1' },
        { property: 'test2' }
      ]
  
      const objectPrototype = new Field('object')
      const objectArrayField = new Field('array', objectPrototype)
      objectArrayField.value = objectArray
  
      expect(objectArrayField.value).to.equal(objectArray)
      expect((<Field> objectArrayField.children[0]).value).to.equal(objectArray[0])
      expect((<Field> objectArrayField.children[1]).value).to.equal(objectArray[1])
    })
  
    it('should propagate object properties to sub fields', function() {
      const now = new Date
  
      const object = {
        array: [],
        boolean: true,
        date: now,
        number: 44,
        object: {
          property1: 'property1',
          property2: 'property2'
        },
        string: 'string'
      }
  
      const arrayField = new Field('array', 'array')
      const booleanField = new Field('boolean', 'boolean')
      const dateField = new Field('date', 'date')
      const numberField = new Field('number', 'number')
      const objectField = new Field('object', 'object')
      const stringField = new Field('string', 'string')
  
      const field1 = new Field('object').add(
        arrayField, booleanField, dateField, numberField, objectField, stringField
      )
  
      field1.value = object
  
      expect(field1.value).to.equal(object)
      expect(arrayField.value).to.equal(object.array)
      expect(booleanField.value).to.equal(object.boolean)
      expect(dateField.value).to.equal(object.date)
      expect(numberField.value).to.equal(object.number)
      expect(objectField.value).to.equal(object.object)
      expect(stringField.value).to.equal(object.string)
  
      const field2 = new Field('object').add(
        new FormElement('formElement').add(
          arrayField, booleanField, dateField, numberField, objectField, stringField
        )      
      )
  
      arrayField.value = undefined
      booleanField.value = undefined
      dateField.value = undefined
      numberField.value = undefined
      objectField.value = undefined
      stringField.value = undefined
  
      expect(arrayField.value).to.equal(undefined)
      expect(booleanField.value).to.equal(undefined)
      expect(dateField.value).to.equal(undefined)
      expect(numberField.value).to.equal(undefined)
      expect(objectField.value).to.deep.equal({})
      expect(stringField.value).to.equal(undefined)
  
      field2.value = object
  
      expect(arrayField.value).to.equal(object.array)
      expect(booleanField.value).to.equal(object.boolean)
      expect(dateField.value).to.equal(object.date)
      expect(numberField.value).to.equal(object.number)
      expect(objectField.value).to.equal(object.object)
      expect(stringField.value).to.equal(object.string)
    })
  })

  describe('get value', function() {
    it('should have undefined values in case of primitive types', function() {
      const booleanField = new Field('boolean')
      const dateField = new Field('date')
      const numberField = new Field('number')
      const stringField = new Field('string')
  
      expect(booleanField.value).to.equal(undefined)
      expect(dateField.value).to.equal(undefined)
      expect(numberField.value).to.equal(undefined)
      expect(stringField.value).to.equal(undefined)
    })
  
    it('should get primitive values', function() {
      let field = new Field()
      field.value = 'a'
      expect(field.value).to.equal('a')

      field.value = 1
      expect(field.value).to.equal(1)

      field.value = true
      expect(field.value).to.equal(true)

      let date = new Date()
      field.value = date
      expect(field.value).to.equal(date)
    })

    it('should get objects', function() {
      let test1 = new Field('string', 'test1')
      test1.value = 'a'
      let test2 = new Field('object', 'test2')
      let test21 = new Field('string', 'test21')
      test21.value = 'b'
      let test22 = new Field('number', 'test22')
      test22.value = 1
      test2.add(test21, test22)
      let field = new Field('object').add(test1, test2)

      let value = field.value

      expect(value).to.deep.equal({
        test1: 'a',
        test2: {
          test21: 'b',
          test22: 1
        }
      })
    })
  })

  describe('clear', function() {
    it('should clear all field values', function() {
      let field1 = new Field()
      let field2 = new Field()

      field1.value = 'a'
      field2.value = 'b'

      let form = new Form().add(
        field1,
        new FormElement().add(
          field2
        )
      )

      form.clear()

      expect(field1.value).to.be.undefined
      expect(field2.value).to.be.undefined
    })
  })

  describe('toObj', function() {
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

    it('should ignore object typed value', function() {
      let form = new Form('root').add(
        new Field('string', 'a'),
        new Field('object', 'b').add(
          new Field('number', 'c')
        )
      )

      let value = {
        a: 'a',
        b: {
          c: 1
        }
      }

      form.value = value
      let obj = form.toObj()

      expect(obj.value).to.be.undefined
      expect(obj.children.length).to.equal(2)
      expect(obj.children[0].value).to.equal('a')
      expect(obj.children[1].value).to.be.undefined
      expect(obj.children[1].children.length).to.equal(1)
      expect(obj.children[1].children[0].value).to.equal(1)
    })
  })

  describe('fromObj', function() {
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

  describe('reset', function() {
    it('should reset properly', function() {
      let form = new Form().add(
        new Field('string', 'a'),
        new Field('number', 'b')
      )
  
      form.value = { a: 'a', b: 1 }
      form.conserveOriginalValues()
  
      form.value = { a: 'b', b: 2 }
      expect(form.value).to.deep.equal({ a: 'b', b: 2 })
      
      form.reset()
      expect(form.value).to.deep.equal({ a: 'a', b: 1 })  
    })
  })
})
