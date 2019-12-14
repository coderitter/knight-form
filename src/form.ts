import { toJsonObj, fromJsonObj, Instantiator } from 'mega-nice-json'

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
   * Get every direct child.
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

  /**
   * Get every direct child which is a field.
   */
  get fields(): Field[] {
    let fields: Field[] = []

    for (let child of this.children) {
      if (child instanceof Field) {
        fields.push(child)
      }
    }

    return fields
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
          this.children.splice(i, 1)
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
        break
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

      // iterate through all children not considering their name
      for (let child of this.children) {
        
        // if the child does not have a name and it has children ask it to find the element
        if (child.children && child.children.length) {
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

  clear() {
    if (this instanceof Field) {
      this.value = undefined
    }

    for (let child of this.children) {
      child.clear()
    }
  }

  keep(...paths: string[]) {
    let keep = []
    for (let path of paths) {
      let element = this.find(path)

      if (element) {
        keep.push(element)
      }
    }

    // with parents
    let allElementsToKeep = []
    for (let element of keep) {
      allElementsToKeep.push(element)
      
      let parent = element.parent
      while (parent) {
        allElementsToKeep.push(parent)
        parent = parent.parent
      }
    }

    let i = 0

    while (i < this.children.length) {console.log('while', i, this.children.length)
      for (i = 0; i < this.children.length; i++) {
        let child = this.children[i]
  console.log(i)
        if (allElementsToKeep.indexOf(child) == -1) {console.log('Removing', child.name)
          this.remove(child)
          console.log('Afer delete:', this.children)
          break
        }
        else {console.log('Not removing', child.name)
          child.keep(...paths)
        }
      }
    }
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

  toObj(excludeProps: string[] = []): any {
    let standardExclude = [ 'parent' ]

    if (excludeProps instanceof Array) {
      standardExclude.concat(excludeProps)
    }

    // set doNotUseConversionMethodOnObject to true to avoid recursion because toJsonObj will call
    // toObj method if present and told not differently to do so
    return toJsonObj(this, { exclude: standardExclude, doNotUseConversionMethodOnObject: true })
  }

  static fromObj(obj: any, instantiator = new FormElementInstantiator()): any {
    return fromJsonObj(obj, instantiator)
  }

  clone(): this {
    const clone = Object.create(this)
    
    clone.parent = this.parent
    clone.name = this.name
    clone.prototype = this.prototype ? this.prototype.clone() : undefined
    clone.widget = this.widget ? this.widget.clone() : undefined // clone appropriately
    clone.more = this.more

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
    if (this.valueType === ValueType.object) {
      let obj

      if (typeof this._value === 'object') {
        obj = this._value
      }
      else if (this._value === undefined) {
        obj = {}
      }
      else {
        return this._value
      }

      for (let field of this.fields) {
        if (field.name) {
          obj[field.name] = field.value
        }
      }

      return obj
    }

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
  title?: string
  required?: boolean
  error?: string
  more: { [key: string]: any } = {}

  constructor(obj: { [key: string]: any }) {
    this.invisible = obj.invisible
    this.disabled = obj.disabled
    this.title = obj.title
    this.required = obj.required
    this.error = obj.error
    this.more = obj.more
  }

  clone(): this {
    const clone = Object.create(this)

    clone.invisible = this.invisible
    clone.disabled = this.disabled
    clone.title = this.title
    clone.required = this.required
    clone.error = this.error
    clone.more = this.more // TODO: clone appropriately

    return clone
  }
}

export class FieldWidget extends Widget {

  password?: boolean

  constructor(obj: { [key: string]: any }) {
    super(obj)

    this.password = obj.password
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

export class FormElementInstantiator extends Instantiator {
  'FormElement' = () => new FormElement()
  'Field' = () => new Field()
  'Form' = () => new Form()
  'Button' = () => new Button()
  'Mapping' = () => new Mapping()
  'FieldValueMapping' = () => new FieldValueMapping()
}
