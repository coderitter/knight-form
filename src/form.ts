import { fillWithJsonObj, FillWithJsonObjOptions, fromJsonObj, Instantiator, toJsonObj } from 'mega-nice-json'

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
  /**
   * Refer an object name which this field belongs to. This is used in conjuntion 
   * with fieldPath which will use the first occuring object name instead of the 
   * usual name.
   */
  objectName?: string
  prototype?: FormElement
  error: any
  widget: Widget = {}
  more: {[key: string]: any} = {}

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
   * Get every field down the form tree.
   */
  getAllFields(): Field[] {
    return this.visit(new FindAllFieldsVisitor())
  }

  setMore(more: {[key: string]: any}): this {
    this.more = more
    return this
  }

  setWidget(widget: Widget): this {
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

  addAfter(element: FormElement|string, ...elements: FormElement[]): this {
    if (typeof element === 'string') {
      let found = this.find(element)

      if (! found) {
        return this.add(...elements)
      }
      else {
        element = found
      }
    }

    let parent = element.parent

    if (! parent) {
      return this.add(...elements)
    }

    let index = parent._children.indexOf(element)
    this._children.splice(index + 1, 0, ...elements)

    for (let element of elements) {
      element._parent = parent
    }
    
    return this
  }

  /**
   * Remove a child wether by reference or by name
   * 
   * @param element May be a FormElement object or a name
   */
  remove(element?: FormElement|string): this {
    // if element is undefined remove the element itself
    if (element === undefined && this.parent) {
      this.parent.remove(this)
    }

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]

      if (typeof element === 'string') {
        if (child.name === element) {
          this.children.splice(i, 1)
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
    for (let child of this.children) {
      child.clear()
    }
  }

  clearErrors() {
    this.error = undefined

    for (let child of this.children) {
      child.clearErrors()
    }
  }

  conserveOriginalValues(recursive: boolean = true) {
    if (recursive) {
      for (let child of this.children) {
        child.conserveOriginalValues()
      }      
    }
  }

  reset(recursive: boolean = true) {
    if (recursive) {
      for (let child of this.children) {
        child.reset()
      }  
    }
  }

  keep(...paths: string[]): this {
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

    while (i < this.children.length) {
      for (i = 0; i < this.children.length; i++) {
        let child = this.children[i]
  
        if (allElementsToKeep.indexOf(child) == -1) {
          this.remove(child)
          break
        }
        else {
          child.keep(...paths)
        }
      }
    }

    return this
  }

  drop(...elements: (FormElement|string)[]): this {
    if (elements.length == 0 && this.parent) {
      this.parent.drop(this)
    }

    for (let elementOrPath of elements) {
      let element
      if (typeof elementOrPath === 'string') {
        element = this.find(elementOrPath)
      }
      else {
        element = elementOrPath
      }

      while (element) {
        // check if there is a parent and if there is remove any parent which has
        // only one child
        if (element.parent && element.parent.children.length == 1) {
          element = element.parent
        }
        else {
          element.remove()
          break
        }
      }
    }

    return this
  }

  visit<T>(visitor: FormVisitor<T>): T {
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
    let exclude = [ 'parent' ]

    if (excludeProps instanceof Array) {
      exclude = exclude.concat(excludeProps)
    }

    // set doNotUseCustomToJsonMethodOfFirstObject to true to avoid recursion because 
    // toJsonObj will call toObj method if present and told not differently to do so
    // if you are getting a problem with infinite recursion this will be the problem
    // do not forget to call this method (super.toObj) if you override
    return toJsonObj(this, {
      exclude: exclude,
      omitPrivatePropertiesAndUseGetMethodsInstead: true,
      omitEmptyArrays: true,
      omitEmptyObjects: true,
      doNotUseCustomToJsonMethodOfFirstObject: true
    })
  }

  static fromObj(obj: any, instantiator = new FormInstantiator()): any {
    return fromJsonObj(obj, instantiator)
  }

  clone(): this {
    const clone = Object.create(this)
    
    clone.parent = this.parent
    clone.name = this.name
    clone.prototype = this.prototype ? this.prototype.clone() : undefined
    clone.widget = this.widget // TODO: clone appropriately
    clone.more = this.more // TODO: clone appropriatley

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
  protected _originalValue: any

  /**
   * Attach options to your field. The standard renderers use this property when dealing with
   * fields of type array. When using the standard renderer you can use class Option. Of course
   * you can adjust the standard renderer to use a sub class of Option or even a completely
   * different class.
   */
  options: any[] = []
  widget: FieldWidget = {}

  constructor(valueType?: string, nameOrOptionsOrPrototype?: string|any[]|FormElement, optionsOrPrototype?: any[]|FormElement) {
    super()

    if (valueType) {
      this.valueType = valueType
    }

    if (nameOrOptionsOrPrototype !== undefined) {
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

      let subFields = this.visit(new FindAllFieldsVisitor)

      if (subFields) {
        for (let field of subFields) {
          if (field.name) {
            obj[field.name] = field.value
          }
        }  
      }

      return obj
    }

    return this._value
  }

  set value(value: any) {
    this._value = value

    if (this.valueType === ValueType.object && typeof value === 'object') {
      let subFields = this.visit(new FindAllFieldsVisitor)

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

  setValue(value: any): this {
    this.value = value
    return this
  }

  setWidget(widget: FieldWidget): this {
    this.widget = widget
    return this
  }

  /**
   * Get the field path. It only considers fields and sub classes but not other form elements.
   */
  get fieldPath(): string {
    let fieldPath = ''
    let element: FormElement|undefined = this
    
    while (element != undefined) {
      if (! (element instanceof Field)) {
        if (element.objectName) {
          fieldPath = element.objectName + '.' + fieldPath
          return fieldPath
        }
      }
      else {
        if (element.valueType === ValueType.object && element.objectName) {
          fieldPath = element.objectName + '.' + fieldPath
          return fieldPath
        }
        else {
          if (element !== this && ! element.name) {
            // leave out if there is an empty part in between
          }
          else {
            fieldPath = element.name + (element !== this ? '.' + fieldPath : '')
          }
  
          if (element.objectName) {
            fieldPath = element.objectName + '.' + fieldPath
            return fieldPath
          }
        }  
      }

      element = element.parent
    }

    return fieldPath
  }

  clear() {
    this.value = undefined

    for(let child of this.children) {
      child.clear()
    }
  }

  conserveOriginalValues(recursive: boolean = true) {
    this._originalValue = this.value

    if (recursive) {
      for (let child of this.children) {
        child.conserveOriginalValues()
      }  
    }
  }

  reset() {
    this.value = this._originalValue

    for (let child of this.children) {
      child.reset()
    }
  }

  toObj(excludeProps: string[] = []): any {
    let exclude: string[] = []

    if (typeof this.value === 'object') {
      exclude.push('value')
    }
    
    if (excludeProps instanceof Array) {
      exclude = exclude.concat(excludeProps)
    }

    return super.toObj(exclude)
  }

  fillWithObj(obj: any, options?: FillWithJsonObjOptions) {
    if (options == undefined) {
      options = {}
    }

    options.doNotUseCustomToJsonMethodOfFirstObject = true

    if (options.instantiator == undefined) {
      options.instantiator = new FormInstantiator()
    }

    fillWithJsonObj(this, obj, options)
    this.conserveOriginalValues(false)
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
  constructor(name?: string, objectName?: string) {
    super(ValueType.object)
    this.name = name
    this.objectName = objectName
  }
}

export class Button extends FormElement { }

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

export interface Widget {
  title?: string
  invisible?: boolean
  disabled?: boolean
  required?: boolean
  [key: string]: any
}

export interface FieldWidget extends Widget {
  password?: boolean
}

function splitPath(path: String) {
  return path.split('.')
}

function joinPath(path: Array<String>) {
  return path.join('.')
}

export abstract class FormVisitor<T = any> {

  result!: T
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

export class FindAllFieldsVisitor extends FormVisitor<Field[]> {

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

export class FormInstantiator extends Instantiator {
  'FormElement' = () => new FormElement()
  'Field' = () => new Field()
  'Form' = () => new Form()
  'Button' = () => new Button()
  'Mapping' = () => new Mapping()
  'FieldValueMapping' = () => new FieldValueMapping()
}
