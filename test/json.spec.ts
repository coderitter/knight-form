import { expect } from 'chai'
import 'mocha'

import { FormElement, Field, Option, Widget } from '../src/form'

describe('Test JSON object conversion', () => {
  it('should transfer all FormElement attributes', () => {
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

  it('should transfer all Field attributes', () => {
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
    
    field.type = 'object'
    field.value = {
      attribute: 'value'
    }
    field.options = [
      {
        attribute: 'value1'
      },
      {
        attribute: 'value2'
      }
    ]

    fieldObj = field.toObj()

    // the value is left out since the field type is 'object'
    expect(fieldObj).to.deep.equal({
      '@type': 'Field',
      type: 'object',
      options: [
        {
          attribute: 'value1'
        },
        {
          attribute: 'value2'
        }
      ]
    })    
  })
})