# jsonui - form

Define your form in JSON.

```json
// CharacterForm.json
{
  "@type": "Form",
  "name": "Character",
  "elements": [
    {
      "@type": "Field",
      "valueType": "String",
      "name": "name"
    },
    {
      "@type": "Field",
      "valueType": "Number",
      "name": "level"
    }
  ]
}
```

Create a form in your app. There is support for multiple languages like JavaScript, TypeScript, Java, C# and so on. A complete list can be found here.

```typescript
var form = new Form("path/to/CharacterForm.json")
```

Render it with on of the many renderers for different platforms like the ones for the browser which support Angular, React or Vue. A complete list of all renderes can be found here.

```typescript
// example in React
ReactForm.render(form)
```

After the user hits the submit button, create an object out of your form.

```typescript
var object = form.toObject()
```
```json
{
  "name": "Arne Steppat",
  "level": 9001
}
```

Do something with it!

# Form

Define a form a form programmatically.

```typescript
var form = new Form()
form.add(
  new Field('string', 'name', 'Name', 'Arne Steppat'),
  new Field('number', 'level', 'Level', 9001)
)
```

## Configure the platform specific widget

The elements of a form a rendered differently depending on the platform and renderer. There are different renderes for different platforms. Like for the browser there are renderes for Angular, React and Vue.

```typescript
var field = new Field('number')
var min = 0
var max = 9000
field.widget = new HtmlInput.number(min, max)
```

If you do not need to configure you can leave it out. The appropriate widget will chosen automatically.

If you are using the built in validators than these will be taken into consideration when your widgets are configured.

## Create an object with all form values

The object will contain every field that was defined in the form.

```typescript
var object = form.toObject()
```

```json
{
  "name": "Arne Steppat",
  "level": 9001
}
```

You can also give it an already existing object.

```typescript
var object = { ... }
form.toObject(object)
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
    agility: "78", // string will be converted to number if possible
    strength: "NaN", // cannot be converted thus will just be assigned as is
    unknownField: "unknown" // will be ignored because the form does not have a corresponding field in the form
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

## Form submission

On form submission use method `toObject` and send the created object to the server. Before you do that you could also make sure that everything is valid.

```typescript
if (form.isValid()) {
  var object = form.toObject()
  http.send('POST', 'dbz.com/form', object)
}
```

On the server you can use it to set the values on the form object there. Create the form from a JSON file that you share across both of them.

```typescript
var form = Form.from('path/to/form.json')
form.setValues(receivedObject)
```

In a second step you could fill the target domain object which will be persisted into the database. Also here you should validate again.

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


# Element

This is the base class of all form elements. Basically there are forms, fields, visual components and behavioural components.

Your element can but does not need to have a name.

```typescript
var form1 = new Form()
var form2 = new Form('Character') // the name will be used when creating the qualified name of an element. this affects the translation messages ids.
```

## Qualified names

```typescript
var field = new Field('string', 'name')

var fieldSet = new FieldSet('general')

var form = new Form('Character').add( // 'Character'
  fieldSet.add( // 'general'
    field // 'name'
  )
)

field.name // == 'name'
field.qualifiedName // == 'Character.general.name'
field.qualifiedFieldName // == 'Character.name'

fieldSet.name // == 'general'
fieldSet.qualifiedName // == 'Character.general'
fieldSet.qualifiedFieldName // error: 'qualifiedFieldName' does only exist on fields

form.name // == 'Character'
form.qualifiedName // == 'Character'
form.qualifiedFieldName // error: 'qualifiedFieldName' does only exist on fields
```

## Find elements

Retreive elements when a visual element is involved.

```typescript
var fieldSet = form.find('general')
var nameField1 = form.find('general.name')
var nameField2 = form.findField('name')
```

Note that fields are a special case here. To retreive a field you only need to consider all the parent fields but not any other parent element apart from fields.

Also when the object is created it ignores every element apart from fields.

```json
{
  "name": "Arne Steppat"
}
```

# ObjectReferenceField

# FieldSet

# Mapped

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

When using the built in validators then your context needs to have a `translate` method to be able to translate the error message ids. Attach you translation framework there.

```typescript
class Context {
  translate(id)
}
```

For more information on the look of the generated error message translation ids refer to the validator documentation.

## Use your own validator

To use your own validation framework you can register a function which will receive your custom app specific context should be able to translate the error message.

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

# Translation

```typescript
form.translate(qualifiedName => translate(qualifiedName)) // in case of a field 'qualifiedName' will be the 'qualifiedFieldName'

field.label // == 'Name'
fieldSet.label // == 'General'
```
