export class FormElement {

  /**
   * The parent. It is protected because we need to care about the parent/child relationships
   * which we will do in the set method.
   */
  protected _parent?: FormElement

  /**
   * The children. It is protected because we want to care about the parent/child relationships
   * which we will do in the set method.
   */
  protected _children: FormElement[] = []

  name?: string
  title?: string
  prototype?: FormElement
  widget?: any
  more: { [key: string]: any } = {}

  /**
   * @param flavor The name (optional)
   */
  constructor(name?: string) {
    this.name = name
  }

  /**
   * Get the parent.
   */
  get parent(): FormElement|undefined {
    return this._parent
  }

  /**
   * Set the parent. You do not need to set this by yourself. If you set it
   * the parents childrens are updated accordingly.
   */
  set parent(parent: FormElement|undefined) {
    if (this._parent != undefined) {
      this._parent.remove(this)
    }

    this._parent = parent
    
    if (parent != undefined) {
      parent.add(this)
    }
  }

  /**
   * Get the root. If called from the root it return the root.
   */
  get root(): FormElement|undefined {
    if (this.parent != undefined) {
      return this.parent.root
    }

    return this
  }

  /**
   * Get the next parent form. Return undefined if there was not any.
   */
  get form(): Form|undefined {
    if (this.parent instanceof Form) {
      return this.parent
    }

    if (this.parent != undefined) {
      return this.parent.form
    }
  }

  /**
   * Get all children.
   */
  get children(): FormElement[] {
    return this._children
  }

  /**
   * Set all children. It will also adjust the parents of the children.
   */
  set children(elements: FormElement[]) {
    this.children.forEach(e => e._parent = undefined)
    this._children = elements
    this.children.forEach(e => e._parent = this)
  }

  setWidget(widget: any): this {
    this.widget = widget
    return this
  }

  /**
   * Add a child element. The added element will get its parent set.
   * 
   * @param element The element to be added.
   */
  add(...elements: FormElement[]): this {
    for (let element of elements) {
      this._children.push(element)
      element._parent = this
    }

    return this
  }

  /**
   * Remove a child wether by reference or by name
   * 
   * @param element May be a FormElement object or a name
   */
  remove(element: FormElement|string): this {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]

      if (typeof element === 'string') {
        if (child.name === element) {
          this.children.splice(i)
        }
      }
      else {
        if (child === element) {
          this.children.splice(i)
        }
      }
    }

    return this
  }

  get path(): string {
    if (! this.name) {
      return ''
    }

    let path = ''
    let element: FormElement|undefined = this
    
    while (element != undefined) {
      if (element.name) {
        path = element.name + (path ? '.' + path : '')
      }

      element = element.parent
    }

    return path
  }

  /**
   * Find an element down the tree with a path. The path can be given in dot notation
   * or as an array consisting of strings.
   * 
   * @param path The path as string or as array of strings
   */
  find(path: string|string[]): FormElement|undefined {
    let pathArray: string[] = []

    // determine if the path was given as string or array
    if (typeof path === 'string') {
      pathArray = splitPath(path)
    }
    else if (path instanceof Array) {
      pathArray = <string[]> path
    }

    // if there is nothing in the path then there is no element to find
    if (pathArray.length == 0) {
      return
    }

    // get the first part of the path and look for an element with that name
    const first = pathArray[0]

    let element
    for (let child of this.children) {
      if (child.name === first) {
        element = child
      }
    }

    // if there are not any more parts in the path we are done
    if (pathArray.length == 0) {
      return element
    }

    // if an element was found
    if (element != undefined) {

      // if the path still has parts left
      if (pathArray.length > 1) {

        // clone the path array
        const clonedPathArray = pathArray.slice()

        // remove first part of the path
        clonedPathArray.shift()

        // go on an look further
        element = element.find(clonedPathArray)
      }
    }
    // if there was no element found
    else {

      // iterator through all children not considering their name
      for (let child of this.children) {
        
        // if the child does not have a name and it has children ask it to find the element
        if (!child.name && child.children && child.children.length) {
          element = child.find(pathArray)
          
          if (element) {
            break
          }
        }
      }
    }

    return element
  }

  findField(path: string|string[]): Field|undefined {
    let pathArray: string[] = []

    // determine if the path was given as string or array
    if (typeof path === 'string') {
      pathArray = splitPath(path)
    }
    else if (path instanceof Array) {
      pathArray = <string[]> path
    }

    // if there is nothing in the path then there is no element to find
    if (pathArray.length == 0) {
      return
    }

    // get the first part of the path and look for an element with that name
    const first = pathArray[0]

    let field: Field|undefined = undefined
    for (let child of this.children) {
      if (child instanceof Field && child.name === first) {
        field = child
      }
    }

    // if there are not any more parts in the path we are done
    if (pathArray.length == 0) {
      return
    }

    // if an element was found
    if (field != undefined) {

      // if the path still has parts left
      if (pathArray.length > 1) {

        // clone the path array
        const clonedPathArray = pathArray.slice()

        // remove first part of the path
        clonedPathArray.shift()

        // go on an look further
        field = field.findField(clonedPathArray)
      }
    }
    // if there was no element found
    else {

      // iterate through all children not considering their name
      for (let child of this.children) {

        // if the child has children ask it to find the element
        if (!child.name && child.children && child.children.length) {
          field = child.findField(pathArray)

          if (field) {
            break
          }
        }
      }
    }

    return field
  }

  visit<T>(visitor: FormVisitor<T>): T|undefined {
    if (! visitor.doNotVisitStartElement) {
      visitor.visit(this)
    }

    for (let child of this.children) {
      if (child != undefined) {
        // the recursion is implemented in the visitor itself
        visitor.visit(child)
      }
    }

    return visitor.result
  }

  toObj(exludedProps: string[] = []): any {
    exludedProps.push('parent')

    let obj: { [key: string]: any } = {}
    
    obj['@class'] = this.constructor.name

    // copy any field that is not private and not the parent
    for (let attr in this) {
      if (! Object.prototype.hasOwnProperty.call(this, attr)) {
        continue
      }

      let attrName = attr.trim() // trick to get a string
      let attrValue: any

      // if the attribute is a private or protected one it should start with _
      if (attr.indexOf('_') == 0) {
        // get property name which should be the same but without the _
        attrName = attr.substr(1)

        // if there is a property on the object use it to retrieve the value
        if (attrName in this) {
          attrValue = (<any> this)[attrName]
        }
      }
      // if it is not private just retrieve the value
      else {
        attrValue = (<any> this)[attrName]
      }

      if (exludedProps.indexOf(attrName) != -1) {
        continue
      }

      // if the value is undefined skip it. We do not want to have it in the object.
      if (attrValue == undefined) {
        continue
      }

      // if the extension attribute is just an empty object, skip it
      if (attrName === 'extension' && Object.keys(attrValue).length === 0) {
        continue
      }
      
      if ((attrName === 'children' || attrName === 'options' || attrName === 'buttons') 
          && (<Array<any>> attrValue).length == 0) {
        continue
      }
      
      // if the value is an object it may have the 'toObj' method
      if (typeof attrValue.toObj === 'function') {
        obj[attrName] = attrValue.toObj()
      }
      // else if it is an array we need to iterate every single array itme
      else if (attrValue instanceof Array) {
        let jsonArray = []

        for (let arrayValue of attrValue) {
          if (typeof arrayValue.toObj === 'function') {
            jsonArray.push(arrayValue.toObj())
          }
          else {
            jsonArray.push(arrayValue)
          }
        }

        obj[attrName] = jsonArray
      }
      // otherwise just set it
      else {
        obj[attrName] = attrValue
      }
    }

    return obj
  }

  fillFromObj(obj: object) {
    if (typeof obj === 'string') {
      try {
        let parsed = JSON.parse(obj)
        this.fillFromObj(parsed)
      }
      catch (e) {
        // do nothing
      }
    }

    for (let attr in obj) {
      if (! Object.prototype.hasOwnProperty.call(obj, attr)) {
        continue
      }

      let attrName = attr.trim() // trick to get a string
      
      if (attr.indexOf('_') == 0) {
        // set property name which should be the same but without the _
        attrName = attr.substr(1)
      }

      if (attrName in obj) {
        (<any> this)[attrName] = Form.fromObj((<any> obj)[attrName])
      }
    }
  }

  static fromObj(obj: any, classMapping = new FormElementTypes()): any {
    if (typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Array) {
      let resultArray = []

      for (let arrayValue of obj) {
        let fromed = Form.fromObj(arrayValue)
        resultArray.push(fromed)
      }

      return resultArray
    }

    if (! ('@class' in obj)) {
      return obj
    }

    let cls = obj['@class']
    let element: any = undefined

    if (cls in classMapping) {
      element = new (<any> classMapping)[cls]()
    }

    if (element instanceof FormElement) {
      element.fillFromObj(obj)

      return element
    }

    return obj
  }

  clone(): this {
    const clone = Object.create(this)
    
    clone.parent = this.parent
    clone.name = this.name
    clone.prototype = this.prototype ? this.prototype.clone() : undefined
    clone.widget = this.widget ? this.widget.clone() : undefined

    for (let child of this.children) {
      if (child) {
        const childClone = child.clone()
        childClone.parent = clone // will add the clone automatically to its parent
      }
    }

    return clone
  }
}

export enum ValueType {
  array = 'array',
  boolean = 'boolean',
  date = 'date',
  number = 'number',
  object = 'object',
  string = 'string'
}

export class Field extends FormElement {

  valueType?: string
  protected _value?: any

  /**
   * Attach options to your field. The standard renderers use this property when dealing with
   * fields of type array. When using the standard renderer you can use class Option. Of course
   * you can adjust the standard renderer to use a sub class of Option or even a completely
   * different class.
   */
  options: any[] = []

  constructor(valueType?: string, nameOrOptionsOrPrototype?: string|any[]|FormElement, optionsOrPrototype?: any[]|FormElement) {
    super()

    if (valueType) {
      this.valueType = valueType
    }

    if (nameOrOptionsOrPrototype) {
      if (typeof nameOrOptionsOrPrototype === 'string') {
        this.name = nameOrOptionsOrPrototype
      }

      if (Array.isArray(nameOrOptionsOrPrototype)) {
        this.options = nameOrOptionsOrPrototype
      }

      if (nameOrOptionsOrPrototype instanceof FormElement) {
        this.prototype = nameOrOptionsOrPrototype
      }
    }

    if (optionsOrPrototype) {
      if (Array.isArray(optionsOrPrototype)) {
        this.options = optionsOrPrototype
      }

      if (optionsOrPrototype instanceof FormElement) {
        this.prototype = optionsOrPrototype
      }
    }
  }

  get value(): any {
    return this._value
  }

  set value(value: any) {
    this._value = value

    if (this.valueType === ValueType.object && typeof value === 'object') {
      const subFields = this.visit(new FindDirectSubFieldsVisitor)

      if (subFields) {
        for (let field of subFields) {
          if (field.name && field.name in value) {
            field.value = value[field.name]
          }
        }
      }
    }

    if (this.valueType === ValueType.array && Array.isArray(value)) {
      // clear all children in any way
      this.children = []

      // if there is a prototype set we can create new children. if not there are simply no children.
      // also the prototype needs to be an instance of Field. Otherwise we cannot set a value.
      if (this.prototype instanceof Field) {
        for (let arrayElement of value) {
          const clone = this.prototype.clone()
          clone.value = arrayElement
          this.add(clone)
        }
      }
    }
  }

  /**
   * Get the field path. It only considers fields and sub classes but not other form elements.
   */
  get fieldPath(): string {
    if (! this.name) {
      return ''
    }

    let fieldPath = ''
    let element: FormElement|undefined = this
    
    while (element != undefined) {
      if (element instanceof Field && element.name) {
        fieldPath = element.name + (fieldPath ? '.' + fieldPath : '')
      }

      element = element.parent
    }

    return fieldPath
  }

  clone(): this {
    const clone = super.clone()

    clone.valueType = this.valueType
    clone.value = this.value

    for (let option of this.options) {
      if (option) {
        const optionClone = option.clone()
        clone.options.push(optionClone)
      }      
    }

    return clone
  }
}

export class Option {

  value: any
  label?: string
  disabled?: boolean

  clone(): this {
    const clone = Object.create(this)

    clone.value = this.value
    clone.label = this.label
    clone.disabled = this.disabled

    return clone
  }
}

export class Form extends Field {

  buttons: Button[] = []

  constructor(name?: string) {
    super(ValueType.object)
    this.name = name
  }

  addButtons(...buttons: Button[]): this {
    buttons.forEach(b => this.buttons.push(b))
    return this
  }
}

export class Button extends FormElement {
  label?: string

  clone(): this {
    const clone = super.clone()
    clone.label = this.label
    return clone
  }
}

export class Mapping extends FormElement {

  mappings: KeyToElement[] = []

  constructor() {
    super()
  }

  addMappings(...mappings: KeyToElement[]): this {
    if (!Array.isArray(this.mappings)) {
      this.mappings = []
    }

    for (let mapping of mappings) {
      this.mappings.push(mapping)
    }

    return this
  }
}

export class KeyToElement {
  key: any
  element?: FormElement
}

export class FieldValueMapping extends Mapping {
  private _decisiveFieldName?: string
  private _decisiveField?: Field

  constructor(decisiveFieldOrFieldName?: Field|string) {
    super()

    if (decisiveFieldOrFieldName) {
      if (typeof decisiveFieldOrFieldName === 'string') {
        this._decisiveFieldName = decisiveFieldOrFieldName
      }
      else if (decisiveFieldOrFieldName instanceof Field) {
        this._decisiveField = decisiveFieldOrFieldName
      }
    }
  }

  get decisiveFieldName(): string|undefined {
    if (this._decisiveFieldName) {
      return this._decisiveFieldName
    }

    if (this._decisiveField) {
      return this._decisiveField.name
    }
  }

  set decisiveFieldName(decisiveFieldName: string|undefined) {
    this._decisiveField = undefined
    this._decisiveFieldName = decisiveFieldName
  }

  get decisiveField(): Field|undefined {
    if (this._decisiveFieldName && this.form != undefined) {
      return this.form.findField(this._decisiveFieldName)
    }

    if (this._decisiveField) {
      return this._decisiveField
    }

    return
  }

  set decisiveField(decisiveField: Field|undefined) {
    this._decisiveFieldName = undefined
    this._decisiveField = decisiveField
  }
}

export class Widget {

  invisible?: boolean
  disabled?: boolean
  label?: string
  required?: boolean
  error?: string

  clone(): this {
    const clone = Object.create(this)

    clone.invisible = this.invisible
    clone.disabled = this.disabled
    clone.label = this.label
    clone.required = this.required
    clone.error = this.error

    return clone
  }
}

function splitPath(path: String) {
  return path.split('.')
}

function joinPath(path: Array<String>) {
  return path.join('.')
}

export abstract class FormVisitor<T = any> {

  result?: T
  doNotVisitStartElement: boolean = false

  abstract visit(element: FormElement): void

  visitDeeper(element: FormElement) {
    if (element && element.children) {
      for (let child of element.children) {
        this.visit(child)
      }
    }
  }
}

export class FindDirectSubFieldsVisitor extends FormVisitor<Field[]> {

  result: Field[] = []
  
  constructor() {
    super()
    this.doNotVisitStartElement = true
  }

  visit(element: FormElement): void {
    if (element instanceof Field) {
      this.result.push(element)
    }
    else {
      this.visitDeeper(element)
    }
  }
}

export class FormElementTypes {
  FormElement = FormElement
  Field = Field
  Form = Form
  Button = Button
  Mapping = Mapping
  FieldValueMapping = FieldValueMapping
}
