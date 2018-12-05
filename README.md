Lean and highly understandably concepts
Superb extensibility, white box
Platform independent
Minimalistic features

# Quick start

A multi platform form library. Create once. Use everywhere.

Create a form in your app.

```typescript
var form = new Form()
form.add(
  new Field('string', 'name', 'Name', 'Arne Steppat'),
  new Field('number', 'level', 'Level', 9001)
)
```

While you add fields to it you simultaneously describe the structure of the object your form should be able to work with. Just call `getValue()` and the form will create an object for you which will have exactly those properties that you have added as a field.

```typescript
var arne = form.getValue()
```
```json
{
  "name": "Arne Steppat",
  "level": 9001
}
```

You also can use an existing object to fill the form with its values. Again it just somehow has to resemble the structure of the object that you described with your fields. That means that it does not have to be complete.

There is support for multiple languages like JavaScript, TypeScript, Java, C# and so on. A complete list can be found here.

```typescript
form.setValue(arne)
```

Once created and initialized you can render the form. There are numerous renderers for example for Angular, React or Vue. But even desktop GUIs are supported like Swing and so on. A exhaustive list can be found here.

```typescript
// example in React
ReactForm.render(form)
```

That is what is basically is. Describe a form, put data in, render it, get data out.

# Element

The element is the base class for every form element. There are five different types.

- Container: `Form`, `Elements`
- Buttons: `Button`
- Fields: `Field`, `ObjectReferenceField`
- Visuals elements: `Row`, `FieldSet`
- Behavioural elements: `Mapping`

Basically the form contains fields that describe the structure on an object. You can add visual elements to it like a field set. You will need buttons and for complicated cases there are behavioural elements.

## Element properties

Every element has the following attributes.

- `parent`: Every element knows its parent.
- `name`: Every element has a name which it can be referred to.
- `invisible`: Is it visible?
- `disabled`: Is it disabled?
- `path`: The path composed of the name of every element up to the root element

You will never have to set the `parent`. This will be done automatically for you when an element is added.

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

form.find('general.reset') // ignores the row and still finds the element
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

## Object retrieval

If you did not set any object on the form it will create one for you. If you did set one the form will just give the one you have set back to you. Having all the values that where edited through form.

```typescript
var form = new Form().add(
  new FieldSet('general').add(
    new Field('string', 'name', 'Name', 'Arne Steppat'),
    new Field('number', 'level', 'Level', 9001)
  )
)

var object = form.getValue()
```

```json
{
  "name": "Arne Steppat",
  "level": 9001
}
```

When the object is created it ignores every element apart from fields.

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
Form.load(jsonString) // from a JSON string
Form.load('path/to/file.json') // from a JSON inside a file
Form.load(new Form().add(...)) // from another form

Form.load({ // from a form alike object
  '@type': 'form',
  name: 'character'
})

```

In the latter case the `type` property is important. Without it the correct form element class cannot be chosen.

## Set values on a form

You can give a JSON string or a form object, wether as a plain data object or as an instantiated form object does not matter.

```typescript
form.setValue(formJson)
form.setValue(formAsObject)
```

You can also input only partially complete objects. It is only important that the field structure and the object structure match somewhere. If you want the form to transfer values.

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
    agility: "78", // it is a string instead of a number! will be converted when set
    strength: 'NaN', // will be assigned as string
    unknownField: 'unknown' // will be ignored because the form does not have a corresponding field
  }
}

form.setValues(arne)
form.find('skills').setValues(arne) // will do nothing because structure does not match
form.find('skills').setValues(arne.skills) // works!
```

The resulting object after a call to `getValue()` will look like this in JSON.

```json
{
  "name": "Arne Steppat",
  "skills": {
    "agility": 78, // the string got converted to its target type
    "strength": "NaN" // was assigned as it was because it could not be converted
    // unknownField is left out because the form did not define any field for it
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

Thus you will want to have the definition on both the client and the server. On the client for displaying and on the server for sanitizing. For sanitizing just put the received object into the form. Load the form from a JSON file for example.

```typescript
var form = Form.load('path/to/form.json')
form.setValue(receivedObject)
```

At some point you need to get the JSON data coming from the client and set in on the corresponding object on the server. You could either convert it on your own or you use our properties lib which already has a solution to this and also plays nicely together with the form.

In a second step you can fill the target domain object which will be persisted into the database. Also here you should validate again.

```typescript
var domainObject = db.load(id)
// fill the data from the recieved object into the domain object
filler.fill(domainOjbect, receivedObject)
form.setObject(domainObject)

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

The field is your building block to describe the structure of the object your form should be able to cope with. Every field represents an attribute on your object.

## Field properties

Look at the field as a building block to describe everything there is to a property needed to display a widget. The field itself does not determine a specific widget. That makes this form library platform independent.

- `value`
- `label`
- `required`
- `errorMessage`

You should not be afraid to inherit the field. It is more like a data container than it yields certain semantics. Thats why there is only one class. Inherit it and then define a widget for it. It is up to you how you like to use the available properties of the field. Here are the four powerful properties.

- `valueType`: The type of the value
- `options`: An array of options to choose from
- `element`: An element which opens up the world for more complex fields especially when dealing with objects
- `elements`: An array of elements

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

You determine the type of a field by setting its value type property. Here are the primitive ones.

- `boolean`
- `date`
- `float32`, `float64`
- `int8`, `int16`, `int32`, `int64`
- `string`

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

Set options on the field if you want to have the user to choose from a give set of possibilities. It can be rendered to a drop down for example but also a auto completion field is thinkable.

Activate the feature on a field by presenting an array of options.

```typescript
var options = [
  new Option(150, "Satan"),
  new Option(9001, "Son Goku"),
  new Option(100000000, "Omni-King", true) // it is disabled
]

var field = new Field("int64", "level", "Level", null, options)
```

## Object fields

An object field has an object as its value. If it does not have options you can give it an element that is rendered for the field.

```typescript
var skills = new Skills()
```

## Array fields

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

The mapping element maps a key to a form element. The key can be really anything. Use it to your liking to create new behavioural elements tailored to your needs. It is just a data structure which can be used for any behaviour.

```typescript
var mapping = new Mapping().add(
  new KeyToElement('key', new Elements().add(
    /// ...
  ))
)
```

## FieldValueMapping

This element maps the value of a field to a form element. If the field has the specified value the corresponding element will shown as if they were part of the parent element.

```typescript
var form = new Form().add(
  new Field('boolean', 'hasTail'),
  new FieldValueMapping('tailMapping', 'hasTail').add( // a mapping that reacts to the value of field 'hasTail'
    new KeyToElement(true, new Elements().add( // if the value of 'hasValue' is true show the following elements
      new Field('number', 'levelWithTail'),
      new Field('number', 'tailLength')
    )
  )
)
```

# Translation

The labels for the elements are translated using the `path` of an element as the translation message id. In case of a field the `fieldPath` will be used instead. That way ids stay stable for fields regardless of being part of a visual elements or not. Add a `Row` for example and the fields inside the new row still have the same translation message id.

```typescript
form.translate(path => {
  // wire your translation framework here
})
```

# Rendering

## Widgets

All of the renderers that we provide will look for a widget on the field.

```typescript
var field = new Field('number')
field.widget = new HtmlInput.number(0, 9001) // min and max values
```

If they find one than then good, they will use it. If not then they are able to choose one that will work for the given field. This is the entrypoint for customizing the configuration of a widget and for attaching new widgets that you created.

# Rendering templates

The way you render your form is dependent on which platform you use. Similar on every platform is the way we want you to work with renderes. In our universe renderers are not some black box components that you choose and that you have to extend mystically. In our universe you download the source of a renderer and include it into your project. The renderer serves as a starting point and if you want to extend it you can do so programmatically.

A renderer is really simple. Basically it is just a mapping from a widget to visual component depending on your plattform. In case of a browser app it will be an HTML template.

Here you can see an example for Angular.

```typescript
@ViewChild('stringInput') private stringInputWidget: TemplateRef<any>;
@ViewChild('numberInput') private numberInputWidget: TemplateRef<any>;
@ViewChild('select') private selectWidget: TemplateRef<any>;
@ViewChild('list') private listWidget: TemplateRef<any>;
@ViewChild('object') private objectWidget: TemplateRef<any>;
@ViewChild('form') private formWidget: TemplateRef<any>;
@ViewChild('fieldSet') private fieldSetWidget: TemplateRef<any>;
@ViewChild('checkbox') private checkboxWidget: TemplateRef<any>;
@ViewChild('mapping') private mappingWidget: TemplateRef<any>;
@ViewChild('dateInput') private dateInputWidget: TemplateRef<any>;
@ViewChild('elements') private elementsWidget: TemplateRef<any>;
```

If you know Angular a little you can see that there are just different templates in an HTML file belonging to an Angular component.

Now all you need to do is to choose the right template.

```typescript
// in case the widget was specified explicitely
if (element.widget != null) {
  return getWidget(element.widget);
}

// in all other cases where the widget is auto detected
if (element instanceof Form) {
  return this.formWidget;
}

if (element instanceof FieldSet) {
  return this.fieldSetWidget;
}

...
```

As you can see, this is really simple. You can alter existing widgets, you can add new ones and you can also add new types of form elements. Once you have the chosen renderer in front of your eyes it should be pretty obvious what to do. Just programm. No black box configuration.

The form library itself really just acts as a boilerplate. It has some characteristics which will help you to describe your problem and it gives you means to work with it really comfortabely but apart from that it serves your needs.

## ???

In the end depends on the rendering algorithm what it does need to produce a proper widget. Though it most likely will want to use every parameter. Still the rendering libs are programmed with a policy of forgiveness in mind. If a value is missing it will chose a meaningful default.

# Validation

## Use the built in validation rules

The form comes bundled with a json validation framework ready to use. To get more information on json validators please refer to this documentation.

You can set validation rules on any form element.

```typescript
var field = new Field('number', 'level')
field.setValidators(new Required(), new Min(0), new Max(9001))
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