import { expect } from 'chai'
import 'mocha'

import { FormElement, Field, Option, Widget } from '../src/form'

describe('Test JSON object conversion', () => {
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