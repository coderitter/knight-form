import { expect } from 'chai'
import 'mocha'

import { FormElement, Field, Option, Widget } from '../src/form'

describe('Test JSON object conversion', () => {
  it('should transfer all FormElement properties', () => {
    let formElement = new FormElement('testName')    
    let formElementObj = formElement.toObj()

    expect(formElementObj).to.deep.equal({
      '@type': 'FormElement',
      name: 'testName'
    })
    
    formElement.prototype = new FormElement('testSubName')
    formElementObj = formElement.toObj()

    expect(formElementObj).to.deep.equal({
      '@type': 'FormElement',
      name: 'testName',
      prototype: {
        '@type': 'FormElement',
        name: 'testSubName'
      }
    })

    formElement.extension = {
      attribute1: 'attribute1',
      attribute2: 'attribute2'
    }
    
    formElementObj = formElement.toObj()

    expect(formElementObj).to.deep.equal({
      '@type': 'FormElement',
      name: 'testName',
      prototype: {
        '@type': 'FormElement',
        name: 'testSubName'
      },
      extension: {
        attribute1: 'attribute1',
        attribute2: 'attribute2'
      }
    })
  })

  it('should transfer all Field properties', () => {
    let field = new Field()
    field.type = 'string'
    let fieldObj = field.toObj()
    
    expect(fieldObj).to.deep.equal({
      '@type': 'Field',
      'type': 'string'
    })

    field.value = 'testValue'
    fieldObj = field.toObj()

    expect(fieldObj).to.deep.equal({
      '@type': 'Field',
      type: 'string',
      value: 'testValue'
    })

    field.options = [ 1, 2, 3 ]
    fieldObj = field.toObj()

    expect(fieldObj).to.deep.equal({
      '@type': 'Field',
      type: 'string',
      value: 'testValue',
      options: [ 1, 2, 3 ]
    })    
  })

  it('should transfer all properties to FormElement', () => {
    let formElementObj = {
      '@type': 'FormElement',
      name: 'testName',
      prototype: {
        '@type': 'FormElement',
        'name': 'testSubName'
      },
      widget: {
        '@type': 'Widget',
        invisible: true
      },
      extension: {
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
    expect(formElement.extension).to.be.not.undefined
    expect(formElement.extension.attribute1).to.equal('attribute1')
    expect(formElement.extension.attribute2).to.equal('attribute2')
  })

  it('should transfer all properties to Field', () => {
    let fieldObj = {
      '@type': 'Field',
      type: 'string',
      value: 'testValue',
      options: [ 'testValue1', 'testValue2']
    }

    let field = FormElement.fromObj(fieldObj)

    expect(field).to.be.instanceOf(Field)
    expect(field.type).to.equal('string')
    expect(field.value).to.equal('testValue')
    expect(field.options).to.deep.equal([ 'testValue1', 'testValue2'])
  })
})