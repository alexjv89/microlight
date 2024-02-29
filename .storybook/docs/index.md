## docs


### Sample component definition
```js
module.exports={
	name:'Component name',
	stories:[
		{
			name:'story name',
			slug:'unique_slug',	
			args:{}, // props
			description:'',
			docs:`
				### story 1
				Write documentation for this particular story here.
			`
		},
		{...}
	],
	docs:`
		Write component docs here.
		### Markdown support
		Markdown is supported here. 
	`
}
```


### Component definition
| key | description | type | required | default value |
|---|---|---|---|---|
| name | name of the component | string | yes |   |
| stories | array of stories | array | no | `[]` |
| docs | write docs for this component in markdown | string | no |  |

### Story definition
| key | description | type | required | default value |
|---|---|---|---|---|
| name | name of the story | string | yes |   |
| slug | unique slug for the component. Should be unique accross all the components in the repo | string | yes |  |
| args | props passed into the component | object | no | `{}` |
| description | option for write a description of the story | string | no |  |
| docs | write docs for this story in markdown | string | no |