# Task

Expected name of a task file - `*.task.js`. 

Task file is expected to be a js file that exports the folowing object:
```
module.exports ={
    slug:'check_duplicate_and_missing_por_numbers',
    name: 'Check duplicate and missing POR numbers',
    description: 'Check duplicate and missing POR numbers (Exponent Energy)',
    inputs: [],
    schedule:{
        crontime: '15 08 * * *',
        timezone:'Asia/Kolkata',
    },
    fn: async function (ml) {
        // function that does the job
        return 'all done';
    }
            
}
```

# Task keys

| key | about | required? | default |
|---|---|---|---|
| slug | unique key that is used to refer to the task. It should unique across all tasks in all folders | yes |  |
| name | Human readable name for the task | yes |  |
| description | Quick description of the task. This will be shown inline with the name of the task | no |  |
| docs | Write detailed documentation of this task. This will shown on the right side bar in the UI. | no |  |
| inputs | json object defines configs for inputs that are accepted by this task. The configs also define how the input is displayed in the UI and the validations that will be run | no | {} |
| schedule | Json object to specify crontime and timezone to run the task on schedule | no | {} |
| fn | function that is executed when the task is triggered. This takes 2 arguments. ml & inputs | yes |  |


## Inputs
Typical inputs looks like the following. The keys for `inputs` become the slug for the input. 
```js
inputs:{
    database:{
        name:'Database',
        description:'Database to take dump of',
        type:'string',
        required:true
    },
    ... 
}
```

| key         | about                                                                      | required? | default |
|-------------|----------------------------------------------------------------------------|-----------|---------|
| name        | Human readable name for the variable                                       | yes       |         |
| description | Help decriber for the variable. Help GUI users understand the input better | no        |         |
| type        | Type of variable. Can be `number`,`string`,`file`                          | yes       |         |
| required    | Is this variable required? Force the GUI user to enter this variable.      | no        | false   |


The following input types are supported:
- `number` - any number input from user
- `string` - any string input from user
- `file` - user can upload a file
- `dropdown` - Users can choose from a list (coming soon)

## Schedule
Typical schedule looks like the folowing:
```js
schedule:{
    crontime:'30 6,12 * * *',
    timezone:'Asia/Kolkata',
},
```

| key      | about                                                    | required? | default |
|----------|----------------------------------------------------------|-----------|---------|
| crontime | The time at which to schedule task in crontime format    | yes       |         |
| timezone | Specify the timezone in which to process the crontime in | no        | utc     |

## fn - the task function
this is the function that will be executed.

this function gets 2 arguments - `ml` & `inputs`
- `ml` - this is the special microlight class object that allows you to trigger microlight functions in the task code block. Mostly used for formating content and print it to the GUI. [Learn more](/docs/reference/ml.md)
- `inputs` - all the inputs specified by the GUI user will be accessible in the code via this variable. 