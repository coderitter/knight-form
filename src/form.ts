export class FormElement {

  /**
   * The parent.
   * 
   * Note: It is protected because we need to care about the parent/child relationships.
   */
  protected _parent: FormElement|null = null

  /**
   * The children.
   * 
   * Note: It is protected because we need to care about the parent/child relationships.
   */
  protected _children: FormElement[] = []

  name: string|undefined = undefined
  prototype: FormElement|null = null
  widget: Widget|null = null

  /**
   * @param name The name (optional)
   */
  constructor(name?: string) {
    if (name) {
      this.name = name
    }
  }

  /**
   * Get the parent.
   */
  get parent(): FormElement|null {
    return this._parent
  }

  /**
   * Set the parent. You do not need to set this by yourself. If you set it
   * the parents childrens are updated accordingly.
   */
  set parent(parent: FormElement|null) {
    if (this._parent !== null) {
      this._parent.remove(this)
    }

    if (parent === null) {
      this._parent = null
    }
    else {
      parent.add(this)
    }
  }

  /**
   * Get the root. If called from the root it return the root.
   */
  get root(): FormElement|null {
    if (this.parent !== null) {
      return this.parent.root
    }

    return this
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
    this._children = elements
    this._children.forEach(e => e._parent = this)
  }

  /**
   * Add a child element. The added element will get its parent set.
   * 
   * @param element The element to be added.
   */
  add(element: FormElement): void {
    this._children.push(element)
    element._parent = this
  }

  /**
   * Remove a child wether by reference or by name
   * 
   * @param element May be a FormElement object or a name
   */
  remove(element: FormElement|string): FormElement|null {
    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i]

      if (typeof element === 'string') {
        if (child.name === element) {
          this._children.splice(i)
          return child
        }
      }
      else {
        if (child === element) {
          this._children.splice(i)
          return child
        }
      }
    }

    return null
  }

  get path(): string {
    if (! this.name) {
      return ''
    }

    let path = ''
    let element: FormElement|null = this
    
    while (element !== null) {
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
  find(path: string|string[]): FormElement|null {
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
      return null
    }

    // get the first part of the path and look for an element with that name
    const first = pathArray[0]

    let element = null
    for (let child of this._children) {
      if (child.name === first) {
        element = child
      }
    }

    // if there are not any more parts in the path we are done
    if (pathArray.length == 0) {
      return element
    }

    // if an element was found
    if (element !== null) {

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
      for (let child of this._children) {
        
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

  findField(path: string|string[]): Field|null {
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
      return null
    }

    // get the first part of the path and look for an element with that name
    const first = pathArray[0]

    let field: Field|null = null
    for (let child of this._children) {
      if (child instanceof Field && child.name === first) {
        field = child
      }
    }

    // if there are not any more parts in the path we are done
    if (pathArray.length == 0) {
      return field
    }

    // if an element was found
    if (field !== null) {

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

      // iterator through all children not considering their name
      for (let child of this._children) {

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

}

export enum FieldValueType {
  array = 'array',
  boolean = 'boolean',
  date = 'date',
  float32 = 'float32',
  float64 = 'float64',
  int8 = 'int8',
  int16 = 'int16',
  int32 = 'int32',
  int64 = 'int64',
  object = 'object',
  string = 'string'
}

export class Field extends FormElement {

  valueType: string = FieldValueType.string
  value: any = undefined

  /**
   * Attach options to your field. The standard renderers use this property when dealing with
   * fields of type array. When using the standard renderer you can use class Option. Of course
   * you can adjust the standard renderer to use a sub class of Option or even a completely
   * different class.
   */
  options: [] = []

  constructor(valueType?: string, name?: string, options?: []) {
    super(name)

    if (valueType) {
      this.valueType = valueType
    }

    if (options) {
      this.options = options
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
    let element: FormElement|null = this
    
    while (element !== null) {
      if (element instanceof Field && element.name) {
        fieldPath = element.name + (fieldPath ? '.' + fieldPath : '')
      }

      element = element.parent
    }

    return fieldPath
  }
}

export class Option {

  value: any = undefined
  label: string = ''
  disabled: boolean = false

}

export class Widget {

}

function splitPath(path: String) {
  return path.split(".")
}

function joinPath(path: Array<String>) {
  return path.join(".")
}