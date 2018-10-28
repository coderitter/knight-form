# Introduction

Create a form in your app. There is support for multiple languages like JavaScript, TypeScript, Java, C# and so on. A complete list can be found here.

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

Render it with one of the many renderers for different platforms like the ones for the browser which support Angular, React or Vue. A complete list of all renderes can be found here.

```typescript
// example in React
ReactForm.render(form)
```

Create an object out of your form.

```typescript
var object = form.toObject()
```
```json
{
  "name": "Arne Steppat",
  "level": 9001
}
```

Or fill an existing object with the data of your form.

```typescript
form.toObject(object)
```

Init a form with an object.

```typescript
form.setValues(object)
```

# Form

## Elements

There are four different types of elements.

- `Form`
- `Button`
- Fields: `Field`, `ObjectReferenceField`
- Visuals elements: `Row`, `FieldSet`
- Behavioural elements: `Mapping`

Fields are used to indicate an affiliation to the object that is created out of the form. Use fields to shape the object your form should create.

Bevavioural elements are for dynamic behaviour. For example the `Mapping` element can exchange parts of your form considering the value of another field.

## Configure the platform specific widget

The elements of a form a rendered differently depending on the platform and renderer. There are different renderes for different platforms. Like for the browser there are renderes for Angular, React and Vue.

```typescript
var field = new Field('number')
var min = 0
var max = 9000
field.widget = new HtmlInput.number(min, max)
```

If you do not need to configure you can leave it out. The appropriate widget will be chosen automatically.

If you are using the built in validators then these will be taken into consideration when your widgets are configured.

## Create an object with all form values

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

## Reset form

If you want to restore all the initial values use the `reset` method.

```typescript
form.reset()
```

## Combine forms

You can combine forms by using a field of type `object`.

```typescript
var skillForm = new Form().add(
  new Field('number', 'agility', 'Agility', 99),
  new Field('number', 'strength', 'Strength', 45)
)

var characterForm = new Form().add(
  new Field('string', 'name', 'Name', 'Arne Steppat'),
  new Field('object', 'skills', 'Skills', skillForm)
)
```

The result object would look like this.
```json
{
  "name": "Arne Steppat",
  "skills": {
    "agility": 99,
    "strength": 45
  }
}
```

You can also put a form inside a form.

```typescript
var characterForm = new Form().add(
  new Field('string', 'name', 'Name', 'Arne Steppat'),
  new Form().add(
    new Field('number', 'agility', 'Agility', 99),
    new Field('number', 'strength', 'Strength', 45)
  )
)
```

But it will not be considered when creating the object.

```json
{
  "name": "Arne Steppat"
}
```

Only fields will be considered. So use it wisely.

## Create a form from

### JSON

Create a form from JSON.

```typescript
var jsonString = '...'
var form = Form.from(jsonString)
```

### JSON file

Create a form from a file containing a JSON string.

```typescript
var form = Form.from('path/to/file.json')
```

### Form data object

Especially after you parsed a JSON string you will get nacked data objects which do not have any methods. Therefor you want to have the real thing.

```typescript
var dataObject = {
  '@type': 'Form',
  ...
}

var form = Form.from(dataObject)
```

## Set values on a form from

### Form

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

### Arbitrary object

You can also input any arbitrary JSON or object. Important is that the field structure and the object structure match somewhere.

```typescript
var object = {
  name: 'Arne Steppat',
  skills: {
    agility: '78', // string will be converted to number if possible
    strength: 'NaN', // cannot be converted thus will just be assigned as is
    unknownField: 'unknown' // will be ignored because the form does not have a corresponding field in the form
  }
}

var skillForm = new Form().add(
  new Field('number', 'agility'),
  new Field('number', 'strength')
)

var characterForm = new Form().add(
  new Field('string', 'name'),
  new Field('object', 'skills', skillForm)
)

characterForm.setValues(object)
skillForm.setValues(object) // will do nothing because structure does not match
skillForm.setValues(object.skills) // works!
```

The resulting object after a call to `toObject` will look like this.

```json
{
  "name": "Arne Steppat",
  "skills": {
    "agility": 78, // corrected to number!
    "strength": "NaN" // could not be corrected
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

If you are using a REST Api or similar than you need to have the definition on both the client and the server. You can achieve this by defining your form in a JSON file.

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

If the form was not valid, send it with the error messages back to the client. If the form was sent with the `submit()` method it will receive the form and put all its error messages in the currently displayed form.

## Register for button events

You can also register for button events.

```typescript
form.listen('submit', button => {
  // do something
})

submitButton.listen(button => {
  // do something
})
```

# Element

This is the base class of all form elements. Basically there are forms, fields, visual components and behavioural components.

Your element can but does not need to have a name.

```typescript
var form1 = new Form()
var form2 = new Form('Character') // the name will be used in the path of an element. this affects translation message ids.
```

## Paths

Every element has a path.

```typescript
var form = new Form('Character').add( // 'Character'
  new FieldSet('general').add( // 'general'
    new Field('string', 'name') // 'name'
  )
)

form.path // == 'Character'
fieldSet.path // == 'Character.general'
field.path // == 'Character.general.name'
```

Fields also have a special path `fieldPath` which only takes fields up until the the first parent form into consideration. This is good for translation because that way the ids are stable. Imagine adding or removing a `FieldSet` and suddenly all translation ids are changing.

```typescript
field.fieldPath // == 'Character.name'
```

Form inside a form which is not associated to a field.

```typescript
var form = new Form('Character').add(
  new Form('Skills').add(
    new Field('number', 'agility')
  )
)

agilityField.fieldPath // == 'Skills.agility'
```

## Find elements

You can find elements by their path.

```typescript
var fieldSet = form.find('general')
var nameField = form.find('general.name')
```

You can find fields by their field path.

```typescript
var nameField = form.findField('name')
```

If you want to find a field inside a form which is not associated to a field you need to start your find request from this form.

```typescript
var skillsForm = new Form('Skills').add(
    new Field('number', 'agility')
  )

var form = new Form('Character').add(
  skillsForm
)

form.findField('agility') // nothing
skillsForm.findField('agility') // works

// using find method
form.find('Skills.agility') // works
```

# Elements

Its a semantic-less container for elements. It is the base clas for all elements containing further elements.

```typescript
var elements = new Elements('elements').add(
  new Field('string', 'race'),
  new Field('string', 'hairColor')
)
```

# ObjectReferenceField

# Row

# FieldSet

# Mapping

The mapping element maps a key to a form element.

```typescript
var mapping = new Mapping().add(
  new KeyToElement('key', new Elements().add(
    /// ...
  ))
)
```

This class serves as a base class. You can attach any logic that you like. Most likely you want to interpret the key as a condition. Look at `FieldValueMapping` for a concrete use case.

# FieldValueMapping

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
