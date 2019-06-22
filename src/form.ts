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
    const first = pathArray.shift()

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

    // if an element was found and the path still has parts left
    if (element !== null) {
      // go on an look further
      element = element.find(pathArray)
    }

    // if there was no element found
    if (element == null) {

    }

    return element
  }
}

export class Widget {

}

function splitPath(path: String) {
  return path.split(".")
}

function joinPath(path: Array<String>) {
  return path.join(".")
}