# Quick start

A nice and flexible data structure describing your forms. It is easily extensible and you can use your domain objects to fill it conveniently. Because it has implementations in many different programming languages you can serialize the data structure to JSON and continue using it somewhere else.

## Create a form

Create a form in your app. There is support for multiple languages like TypeScript, Java, Go, C# and so on. A complete list can be found here.

```typescript
var form = new Form()

form.add(
  new Field('string', 'name'),
  new Field('number', 'level')
)

form.setTitle('My first form')
form.addButtons(new Button('submit'))
```

## Set values

The fields in your form describe the structure of the object your form should be able to work with. You can use those objects to set the values of the fields. The field names determine the name of the property on the object.

```typescript
arne = {
  name: "Arne Steppat",
  level: 9001
}

form.value = arne
```

While the user plays around with the form the object will reflect the changes immediately.

## Get values

If you did not provide any object the form will create one for you.

```typescript
var arne = form.value
```

## Render

Now that your form is there you can render it. The special thing about our renderers is that we do not provide you some black box configuration magic. We give you the source code. This way you can look at it and understand for yourself. True to the motto when you can understand it you can extend it.

So basically you create a renderer for one project which is able to render your form exactly in that look of your application. So every time you render a form you will get the same result and if you want to change something about your forms you do it in exactly one place.

There are numerous renderers for different plattforms available as a starting point and the list continues to grow. There already is support for Angular and React but also for Android and iOS. Even some desktop GUIs starting to be supported. An exhaustive list can be found here.

```html
<!-- React -->
<Form form=form />

<!-- Angular -->
<form [form]="form" />
```

This is what it basically is. Describe a form, put data in, render it, get data out.

# Overview

The data structure is a tree. Every element in the tree is an instance of class `Element` or one of its sub classes. Basically there is only one other sub class that is worth mentioning which is `Field`. A field represents user inputtable value.

So what you can do is adding fields to represent user inputtable values. You can add visual elements like a fieldset or a row to align elements in a row. You can add buttons which have some instant dynamic behaviour on the form or buttons that submit the form. Also you can add more complex behavioural elements like a mapping which is able to replace parts of the form with other elements depending on a value of a field.

There are the following elements available and you may add as many as you like.

- Fields: `Field`, `Form`
- Buttons: `Button`
- Visuals elements: `Row`, `FieldSet`, `FormFrame`
- Behavioural elements: `Mapping`, `FieldValueMapping`

Buttons, visual elements and behavioural elements are in fact just sub classes of `Element`. We differentiate them hear simply to have a nicer way of thinking about it.

And yes, the form itself is a field. It is your root element and because it is a field you also can nest it inside other forms. So you will be able to define forms for your domain objects and then you can combine them. You will just want get rid of the form frame and its buttons when rendering. The good thing is that you do not need to think about it because our renderers will do that automatically.

UML diagram

# Element

The `Element` is the base class for every element in the tree. Here are its properties.

- `parent`: Every element knows its parent. (You do not have to set it by yourself.)
- `elements`: Every element can have arbitrary many sub elements. (It is a tree.)
- `name`: Every element has a name which it can be referred to. Additionally to its core function you can use it for anything you need. This is the idea here. It is a data structure.
- `prototype`: It is not used in the base element. It is used in `Field` when having a list where you can add and remove items. Use it for whatever you think.
- `widget`: Here you can set view specific attributes.

This element is the starting point if you do not have to deal with use inputtable values. Create anything you like from it. Remember is is just a data structure. The renderer that you create will decide what to do with your custom elements.

Do not be afraid to extend it.

## Element properties act as features

Setting values on the elements is always optional. Think of it like activating a feature if you set a certain property. If you do not need a certain feature the library will not mind.

For example if you leave out the name and you want to retreive that element by its name it will not find it. It will find nothing.

## Extending the element by adding properties

Because you are in TypeScript it is very easy to add further properties. You just need to do it.

```typescript
var field = new Field('string', 'name')
field.validators = [ new Required() ]
```

Here we add an array of validators to the field. You do not need to subclass the field to do it.

[Insert a hint on how to use it? Refer to the corresponding section]

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

## Retrieving elements

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
form.find('general.level')
```

If an element which contains sub elements does not have a name it will still be taken into consideration.

```typescript
var form = form.add(
  new FieldSet('general').add(
    new Field('string', 'name'),
    new Row().add( // does not have a name
      new Button('clear')
    )
  )
)

form.find('general.clear') // ignores the row and still finds the element
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

# Field

The field is your building block to describe the structure of the object your form should be able to cope with. Every field represents an attribute on your object.

## Field properties

Look at the field as a building block to describe everything there is to a property needed to display a widget. The field itself does not determine a specific widget. That makes this form library platform independent.

- `valueType`: The type of the value
- `value`: The actual value
- `options`: An array of options to choose from

You should not be afraid to inherit the field. It is more like a data container than it yields certain semantic. Thats why there is only one class. Inherit it and then define a widget for it. It is up to you how you like to use the available properties of the field.

## The field path

Fields additionally have a special path `fieldPath` which only takes fields into consideration. This is good for translation because that way the ids are stable. Imagine adding or removing a `FieldSet` and suddenly all translation ids are changing.

```typescript
new Form('character').add(
  new FieldSet('general').add(
    new Field('string', 'name') // character.name <- general is ignored
  )
)
```

## Primitive type fields

You determine the type of a field by setting its value type property. Here are the primitive ones.

- `boolean`
- `date`
- `float32`, `float64`
- `int8`, `int16`, `int32`, `int64`
- `string`

The constructor for all of these look the same.

```typescript
var booleanField = new Field('boolean', 'name')
```

Just exchange the value type `boolean` with anything from the list above.

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

var field = new Field("int64", "level", options)
```

## Object fields

An object field has an object as its value. Add sub elements which will determine the properties of your sub object.

```typescript
new Form().add(
  new Field('object', 'skills').add(
    new Field('number', 'agility'),
    new Field('number', 'strength')
  )
)
```

Or add options for example if you just want to reference an object.

```typescript
var friendsField = new Field('object', 'friend')
friendsField.addOptions(
  new Option('Son Goku', { id: 1 }), // the value here is an object
  new Option('Son Gohan', { id: 2 })
)
```

This scenario of referencing ids could also be solved differently through a field of type `number`. It all depends on what you need.

## Array fields

If you initialize a field as an array you will need to give it a prototypical element. Is is used to create elements for the existing array items and when adding new ones. The prototype can be any form element.

```typescript
new Field('array', 'favouriteFood', new Field('object').add(
  new Field('string', 'name'),
  new Field('string', 'place')
))
```

The prototypical element does not need to have a name otherwise every form element in the array field will have the same name. Also it can be any form element of course.

Or how about adding options?

# Form

The form is just a field. Thus it can have different values types.

```typescript
var objectForm = new Form() // a form representing an object (the value type does not have to be set explicitly)
var arrayForm = new Form('array') // a form representing an array
var numberForm = new Form('number') // a form representing a number

objectForm.value // an object
arrayForm.value // an array
numberForm.value // a number
```

Also they are easily combinable.

```typescript
objectForm.add(arrayForm, numberForm)
```

## Form frame

The form has the `FormFrame` attached to it. It is a basic visual element which comes with a title and buttons. The reason for this is that you can use the `Form` as the root element so that you can use its `value` property directly. For convenience the `Form` yields the same properties as the `FormFrame` and the constructor even accepts its title.

```typescript
var form = new Form("Title")
form.addButtons(new Button("submit"))

// for forms having a value type other then object
var arrayForm = new Form("array", "Title")
```

If you do not need it then just ignore it. If you do not like it then just create your own form frame.

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

In the latter case the `@type` property is important. Without it the correct form element class cannot be chosen.

## Object treatment

If you did not set any object on the form it will create one for you. If you did set one the form will just give the one you have set back to you. Having all the values that where edited through form.

```typescript
var form = new Form().add(
  new FieldSet('general').add(
    new Field('string', 'name'), // 'Arne Steppat'
    new Field('number', 'level') // 9001
  )
)

var object = form.value
```

```json
{
  "name": "Arne Steppat",
  "level": 9001
}
```

When the object is created it ignores every element apart from fields.

## Set values on a form

You can also input only partially complete objects. It is only important that the field structure and the object structure match somewhere.

```typescript
var form = new Form().add(
  new Field('string', 'name'),
  new Field('object', 'skills').add(
    new Field('number', 'agility'),
    new Field('number', 'strength')
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

form.value = arne
form.find('skills').value = arne // will do nothing because structure does not match
form.find('skills').value = arne.skills // works!
```

The resulting object in JSON.

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

## Reset form

If you want to restore all the initial values use the `reset` method.

```typescript
form.reset()
```

# Buttons

work in progress...

## Register for events

You can also register for button events.

```typescript
// let the form find the element and set a listener on it
form.listen('submit', button => {
  
})

// set listener directly on the element
form.find('submit').listen(button => {
  
})
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

## Create your own

Just extend `Element` and do whatever you need to do.

```typescript
class Separator extends Element {
}
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

# Rendering

If you do not have any renderer code as a boilerplate for your new project you will want to write it on your own. Create an infrastructure consisting of widgets and their mapping to concrete components of your platform dependent UI framework.

## Widgets

The widget that we ship has the following basic properties.

- `invisble`
- `disabled`
- `label`
- `required`
- `error`

Define any widget that you may need.

```typescript
class NumberInput extends Widget {
  public min: number
  public max: number
}
```

## Templates

The way you render your form is different in every famework you use. Similar is the way we want you to work with renderers. In our universe renderers are not some black box components that you choose and which you can only extend in a mystical way. In our universe you download the source of one of our provided renderers and include it into your project. Most of the time this is one file. The renderer serves as a starting point from which on you extend it. Programmatically. Not through mystic configuration.

A renderer is really simple. It is just a mapping from a field to visual representation.

Here you can see an example for Angular. The following code snippet is the TypeScript part of an Angular component `form.component.ts`.

```typescript
@ViewChild('stringInput') private stringInputTemplate: TemplateRef<any>;
@ViewChild('numberInput') private numberInputTemplate: TemplateRef<any>;
@ViewChild('select') private selectTemplate: TemplateRef<any>;
@ViewChild('list') private listTemplate: TemplateRef<any>;
@ViewChild('object') private objectTemplate: TemplateRef<any>;
@ViewChild('form') private formTemplate: TemplateRef<any>;
@ViewChild('fieldSet') private fieldSetTemplate: TemplateRef<any>;
@ViewChild('checkbox') private checkboxTemplate: TemplateRef<any>;
@ViewChild('fieldValueMapping') private fieldValueMappingTemplate: TemplateRef<any>;
@ViewChild('dateInput') private dateInputTemplate: TemplateRef<any>;
@ViewChild('element') private elementTemplate: TemplateRef<any>;
```

This is the complete list of template references which are defined in the HTML part of the Angular component `form.component.html`. Here for example is the definition of an Angular template for the number input widget.

```html
<ng-template #checkbox let-field="element" let-widget="element.widget">
  <input matInput [(ngModel)]="field.value" [type]="number" [disabled]="widget.disabled" [placeholder]="widget.label" [min]="widget.min" [max]="widget.max" />
</ng-template>
```

If you want to change it just edit the file. You included it into your project for this purpose.

The next step is to determine the appropriate wiget for the field. Either the field has a widget object attached. In this case just return the corresponding template. Or determine the widget based on the data found on the field. Here you can see how the property `valueType` is used to determine the appropriate widget.

```typescript
public getWidget(element: Element): TemplateRef<any> {
  // in case the widget was specified explicitely
  if (element.widget != null) {
    return element.widget;
  }

  // in all other cases the widget is auto detected
  if (element instanceof Field) {
    if (element.valueType == 'number') {
      return new NumberInput(); // can contain meaningful defaults
    }
  }
}
```

The next step is a mapping from a widget to a template.

This is the way we do it. But you do not necessarily do it the same way. You can go nuts here. It all depends on your imagination. No deterministic configuration logic which prevents you from exrepssing what you really need. It is just good old programming. This is very accessible for anyone without the need to learn black box behaviour.

The next thing that you want to do is to react to a form submission. Exactly the way you need it to be. There is the `onSubmit()` method which is already implemented but if you do not like it then replace it. Or just extend it. It is up to you.

# Visitor

We have built a visitor which visits every element of the form tree.

```typescript
button(button: Button)
element(element: Element)
field(field: Field)
form(form: Form)
formFrame(formFrame: FormFrame)
fieldValueMapping(fieldValueMapping: FieldValueMapping)
```

Use it to implement your own functionality.

Run it like this.

```typescript
form.visit(new YourVisitor())
```

## Translation

To use your favourite translation mechanism create a visitor.

```typescript
class TranslationVisitor extends FormVisitor {
  
  constructor(private translator: YourTranslator)

  element(element: Element) {
    translator.translate(element.path) // use the path to create a nice translation id
  }

  field(field: Field) {
    translator.translate(field.fieldPath) // use the field path for fields to be independent of tree changes
  }
}
```

And run it.

```typescript
form.visit(new TranslationVisitor())
```

## Validation

Attach your validation objects or whatever it is directly on the form elements.

```typescript
var field = new Field('string', 'name')
field.validators = [
  new Required(), new MaxLength(255)
]
```

Then create a visitor and use your favourite validation framework.

```typescript
class ValidationVisitor extends FormVisitor {

  public valid: boolean

  field(field: Field) {
    var validators = field.validators
    validators.forEach(validator => this.valid &= validator.isValid(field.value))
  }
}
```

And then validate.

```typescript
var validationVisitor = new ValidationVisitor();
form.visit(validationVisitor)

if (! validationVisitor.valid) {
  // ...
}
```