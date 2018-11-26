# Introduction

A multi platform form library. Create once. Use everywhere.

Create a form in your app.

```typescript
var form = new Form()
form.add(
  new Field('string', 'name', 'Name', 'Arne Steppat'),
  new Field('number', 'level', 'Level', 9001),
  new Row().add(
    new Button('reset', 'Reset'),
    new Button('submit', 'Submit')
  )
)
```

There is support for multiple languages like JavaScript, TypeScript, Java, C# and so on. A complete list can be found here.

Render it with one of the many renderers for different platforms like the ones for the browser which support Angular, React or Vue. A complete list of all renderes can be found here.

```typescript
// example in React
ReactForm.render(form)
```

Create an object out of your form.

```typescript
var arne = form.toObject()
```
```json
{
  "name": "Arne Steppat",
  "level": 9001
}
```

Or fill an existing object with the data of your form.

```typescript
form.toObject(arne)
```

Use it again to fill the form with values.

```typescript
form.setValues(arne)
```

# Element

The element is the base class for every form element. There are four different types.

- Container: `Form`, `Elements`
- `Button`
- Fields: `Field`, `ObjectReferenceField`
- Visuals elements: `Row`, `FieldSet`
- Behavioural elements: `Mapping`

Basically the form contains fields that describe the structure on an object. You can add visual elements to it like a field set. You will need buttons and for complicated cases there are behavioural elements.

## Element properties

Every element has the following attributes.

- `parent`: Every element knows its parent.
- `name`: Every element has a name which it can be refered to.
- `invisible`: Is it visible?
- `disabled`: Is it disabled?
- `path`: The path composed of the name of every element up to the root element

You will never have to set the `parent`. This will done automatically for you when an element is added.

The `name` will be used to be able to retreive an element from the form. In case of fields the name additionally reflects an attribute name on one of your objects.

## Paths

Every element has a path. It is composed of every element's name up to the root element.

```typescript
new Form('character').add( // character
  new FieldSet('general').add( // character.general
    new Field('string', 'name') // character.general.name
  )
)
```

If an element does not have a name it is ignorned.

## Retreiving elements

The `find()` method lets you retreive any element from any element. A dot notation is used to access fields down the chain.

```typescript
var form = form.add(
  new FieldSet('general').add(
    new Field('string', 'name'),
    new Field('number', 'level')
  )
)

form.find('general')
form.find('general.name')
```

If an element which contains sub elements does not have a name it will still be taken into consideration.

```typescript
var form = form.add(
  new FieldSet('general').add(
    new Field('string', 'name'),
    new Row().add( // does not have a name
      new Button('reset'),
      new Button('submit')
    )
  )
)

var resetButton = form.find('general.reset') // ignores the row and still finds the element
```

At first the form tries to resolve the path gapless not considering container elements without a name. If this fails the form starts to search the whole tree matching the path allowing gaps. If it finds only one element it will return it. Otherwise it will return null leaving a error message in the log.

We use a very tolerant approach here in order to meet you. Even if you are being more loose in your specifications the form will still try to make the best out of it.

## Parent

Because every element knows its parent there is some functionality available.

```typescript
element.parent
element.root // the root element which can be the form but has not to be
element.form // the next parent form up in the chain
element.path // the complete path of the element up the the root
```

## Element properties act as features

Setting values on the elements is always optional. Think of it like activating a feature if you set a certain property. If you do not need a certain feature the library will not mind. This is a different approach then to create sub classes for every variant.

For example if you leave out the name and you want to retreive that element by its name you will not find it. It will find nothing. If you want to create an object and a field does not have a name it will simply be left out.

# Form

The form always represents the realm of an object. It is able to create a specific object that you can configure.

```typescript
new Form('name')
```

## Object creation

The object will contain every field that was defined in the form.

```typescript
var form = new Form().add(
  new FieldSet('general').add(
    new Field('string', 'name', 'Name', 'Arne Steppat'),
    new Field('number', 'level', 'Level', 9001)
  )
)

var object = form.toObject()
```

```json
{
  "name": "Arne Steppat",
  "level": 9001
}
```

When the object is created it ignores every element apart from fields.

You can also give it an already existing object.

```typescript
var object = { ... }
form.toObject(object)
```

If you have a form inside a form the inner form will not be considered when creating the object.

```typescript
new Form().add(
  new Field('string', 'name', 'Name', 'Arne Steppat'),
  new Form().add(
    new Field('number', 'agility', 'Agility', 99),
    new Field('number', 'strength', 'Strength', 45)
  )
)
```

```json
{
  "name": "Arne Steppat"
}
```

Only fields will be considered because they declare an affiliation to the object. So use it wisely.

## Reset form

If you want to restore all the initial values use the `reset` method.

```typescript
form.reset()
```

## Form creation from different sources

You can create forms from a form definitions in JSON and in general from objects that have the same properties as the form elements including form elements itself.

```typescript
Form.from(jsonString) // from a JSON string
Form.from('path/to/file.json') // from a JSON inside a file
Form.from(new Form().add(...)) // from another form

Form.from({ // from a form alike object
  '@type': 'form',
  name: 'character'
})

```

In the latter case the `type` property is important. Without it the correct form element class cannot be chosen.

## Set values on a form

You can give a JSON string or a form object, wether as a plain data object or as an instantiated form object does not matter.

```typescript
form.setValues(formJson)
form.setValues(formAsObject)
```

You can also give it only a sub part of the form. Important is that the names and the types of the elements match.

```typescript
var form = new Form().add(
  new Field('string', 'name')
)

var nameField = new Field('string' 'name', 'Name', 'Arne Steppat')

form.setValues(nameField)
```

Results in the object.

```json
{
  "name": "Arne Steppat"
}
```

You can also input any arbitrary JSON or object. Important is that the field structure and the object structure match somewhere.

```typescript
var form = new Form().add(
  new Field('string', 'name'),
  new Field('object', 'skills', new Form().add(
    new Field('number', 'agility'),
    new Field('number', 'strength'))
  )
)

var arne = {
  name: 'Arne Steppat',
  skills: {
    agility: 78,
    strength: 'NaN', // will be assigned as string
    unknownField: 'unknown' // will be ignored because the form does not have a corresponding field in the form
  }
}

form.setValues(arne)
form.find('skills').setValues(arne) // will do nothing because structure does not match
form.find('skills').setValues(arne.skills) // works!
```

The resulting object after a call to `toObject()` will look like this in JSON.

```json
{
  "name": "Arne Steppat",
  "skills": {
    "agility": 78,
    "strength": "NaN"
  }
}
```

## Actions and form submission

You can set an action on a form.

```typescript
form.action = new Action('POST', 'dbz.com/form')
```

Then you need to give the form a function with the following signature.

```typescript
form.http = (method, url, data, callback) => {
  // wire your HTTP client here
}
```

Now you can submit the form.

```typescript
form.submit()

// or give the function as a parameter
form.submit((method, url, data, callback) => { ... })
```

It will check if everything is valid, then create the resulting object and send it via your given function to its target.

If there is another form in your form which is not associated to a field and if this form also has an action it will be sent too.

```typescript
var form = new Form().add(
  new Form('inner')
)

form.action = new Action('POST', 'dbz.com/form')
form.find('inner').action = new Action('PUT', 'dbz.com/inner')

form.submit() // two HTTP requests are sent
```

On the server side you receive the object and put it into the same form as on the client. This is important for sanitizing the data coming from the client. You could also send the whole form but that way the client could send you any form which opens the door for abuse.

This you will want to have the definition on both the client and the server. On the client for displaying and on the server for sanitizing. For sanitizing just put the received object into the form. Load the form from a JSON file for example.

```typescript
var form = Form.from('path/to/form.json')
form.setValues(receivedObject)
```

But there are different possibilities to approach this. We for example prefer to have all form definitions on the server and send them ready to use to the client which remaining task is to display them. This way the client does not need to fetch the raw data and execute business logic on it. Business logic that already was implemented on the server. More on this read the article here.

In a second step you can fill the target domain object which will be persisted into the database. Also here you should validate again.

```typescript
var domainObject = db.load(id)
form.toObject(domainObject)

if (form.isValid(context)) {
  db.save(domainObject)
}
else {
  // send the whole form back to the client which will then can render it again with all the error messages
}
```

If the form was not valid, send it with the error messages back to the client. If the form was sent with its `submit()` method it will receive the form and put all its error messages in the currently displayed one.

## Register for button events

You can also register for button events.

```typescript
// let the form find the elemnt and set a listener on it
form.listen('submit', button => {
  
})

// set listener directly on the element
form.find('submit').listen(button => {
  
})
```

# Elements

Its a semantic-less container for elements. It is also the base class for all elements containing further elements.

```typescript
var elements = new Elements('elements').add(
  new Field('string', 'race'),
  new Field('string', 'hairColor')
)
```

# Field

The field is your building block to describe the structure of the object your form should be able to cope with. Every field represents an attribute on your object. So you can design the form in a way it works together with the objects of your application flawlessly.

## The field path

Fields additionally have a special path `fieldPath` which only takes fields into consideration. This is good for translation because that way the ids are stable. Imagine adding or removing a `FieldSet` and suddenly all translation ids are changing.

```typescript
new Form('character').add(
  new FieldSet('general').add(
    new Field('string', 'name') // character.name
  )
)
```

Here is an example for a form inside a form. The `fieldName` will only consider fields up to the next form element up the chain.

```typescript
var form = new Form('character').add(
  new Form('skills').add(
    new Field('number', 'agility') // skills.agility
  )
)
```

You can find more on forms inside forms here.

## Primitive type fields

Primitive types that have the simplest configuration.

- boolean
- date
- float32, float64
- int8, int16, int32, int64
- string

The constructor for all of these look the same.

```typescript
var booleanField = new Field('boolean', 'name', 'label', value)
```

Just exchange the value type `boolean` with anything from the above list.

In the field the name additionally represents the name of an attribute on an object. It is key for mapping your form fields to actual object attributes.

## Fields with options

An option is basically a value and a label. 

```typescript
var option = new Option(value, 'label', disabled)
```

It can be rendered to a drop down for example. But a widget could chose to render something completely different. The field itself does not describe a specific apperance. It only provides the data needed to render something meaningful.

Activate the feature on a field by presenting an array of options.

```typescript
var options = [
  new Option(150, "Satan"),
  new Option(9001, "Son Goku"),
  new Option(100000000, "Omni-King", true) // it is disabled
]

var field = new Field("int64", "level", "Level", null, options)
```

Now it will be rendered as something the user can choose from.

## Object fields

An object field has an object as its value.

```typescript
var skills = new Skills()
```

## Array fields

## ObjectReferenceField



```typescript

```

# Visual elements
## Row

A visual element to define that the contained elements should be in a row.

```typescript
var row = new Row('rowName').add(
  // any element
)
```

## FieldSet

A visual element to define that the contained elements should be framed.

```typescript
var fieldSet = new FieldSet('fieldSetName').add(
  // any element
)
```

# Behavioural elements

## Mapping

The mapping element maps a key to a form element. Use it to your liking to create new behavioural elements tailored to your needs. It is just a data structure which can be used for any behaviour.

```typescript
var mapping = new Mapping().add(
  new KeyToElement('key', new Elements().add(
    /// ...
  ))
)
```

This class serves as a base class. You can attach any logic that you like. Most likely you want to interpret the key as a condition. Look at `FieldValueMapping` for a concrete use case.

## FieldValueMapping

This element maps the value of a field to a form element. If the field has the specified value the corresponding element will be inlined into the form.

```typescript
var form = new Form().add(
  new Field('boolean', 'hasTail'),
  new FieldValueMapping('elementName', 'hasTail').add(
    new KeyToElement(true, new Elements().add(
      new Field('number', 'levelWithTail'),
      new Field('number', 'tailLength')
    )
  )
)
```

If the field with name `hasTail` has the value `true` the `Elements` element will be inlined into the parent element.

That way you can show further form elements if a field has a certain value.

# Translation

The labels for the elements are translated using the `path` of an element as the translation message id. In case of a field the path will be the `fieldPath`. That way ids stay stable regardless of changes in visual elements or not. Add a `Row` for example and the fields inside the new row still have the same translation message id.

```typescript
form.translate(path => {
  // wire your translation framework here
})
```

# Widgets

The elements of a form a rendered differently depending on the platform and renderer. There are different renderes for different platforms. Like for the browser there are renderes for Angular, React and Vue.

```typescript
var field = new Field('number')
var min = 0
var max = 9000
field.widget = new HtmlInput.number(min, max)
```

If you do not need to configure you can leave it out. The appropriate widget will be chosen automatically.

If you are using the built in validators then these will be taken into consideration when your widgets are configured.

## ???

In the end depends on the rendering algorithm what it does need to produce a proper widget. Though it most likely will want to use every parameter. Still the rendering libs are programmed with a policy of forgiveness in mind. If a value is missing it will chose a meaningful default.

# Validation

## Use the built in validation rules

The form comes bundled with a json validation framework ready to use. To get more information on json validators please refer to this documentation.


You can set validation rules on any form element.

```typescript
var field = new Field('number', 'level')
field.setValidators(new Required(), new Min(0), new Max(9000))
```

When using the built in validators the widgets will be configured automatically. In this example the HTML input widget will have set its `min` and `max` attributes to `0` and `9000` respectively.

## Validate

You can give your custom app specific context object to the `validate` method. 

```typescript
form.isValid(context)
form.isValid() // you can leave the context out if you do not need it
nameField.isValid(context) // you can call validate on any form element
```

*** This is work in progress ***

When using the built in validators then your context needs to have a `translate` method to be able to translate the error message ids.

```typescript
class Context {
  translate(path) {
    // wire your translation framework there
  }
}
```

For more information on the look of the generated error message translation ids refer to the validator documentation.

## Use your own validator

To use your own validation framework you can register a function which will receive your custom app specific context. That way you can access resources from your framework which you can use to translate the error messages for example.

```typescript
var field = new Field('string', 'name')
field.setValidator(context => {
  // do something on your own
  var levelField = this.parentForm.findField('level')
  if (levelField.value > 9000 && this.value != 'Son Goku') {
    field.error = context.translate('level.error') // "Only Son Goku can have a skill level of over 9000!"
    return false
  }
  
  return true
})
```

# Extending

## Inheriting fields

## Register your fields in the engine

## Add widgets