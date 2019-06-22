export class FormElement {

  parent: FormElement
  elements: FormElement[]
  name: string
  prototype: FormElement
  widget: Widget

  find(pathStringOrArray: string|Array<string>): FormElement {
    let path = []

    // determine if the path was given as string or array
    if (typeof pathStringOrArray === 'string') {
      path = splitPath(pathStringOrArray)
    }
    else if (pathStringOrArray instanceof Array) {
      path = pathStringOrArray
    }

    // if there is nothing in the path then there is no element to find
    if (path.length == 0) {
      return null
    }

    // get the first part of the path and look for an element with that name
    const first = path.shift()
    let element = this.elements.find(e => e.name === first)

    // if there are not any more parts in the path we are done
    if (path.length == 0) {
      return element
    }

    // if there are still parts left in the path we go on an look further
    element = element.find(path)

    // if there was no element found
    if (element == null) {

    }
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